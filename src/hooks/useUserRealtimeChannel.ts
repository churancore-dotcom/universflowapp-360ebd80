import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Safe realtime subscription scoped to the current authenticated user.
 *
 * Why this exists
 * ---------------
 * Calling `supabase.channel('global')` and listening to `postgres_changes`
 * without a filter forwards EVERY row change in the publication to the
 * client. RLS still hides rows on SELECT, but the realtime payload itself
 * leaks event metadata + (for tables without RLS on the realtime publication)
 * may leak rows from other users.
 *
 * This hook enforces:
 *  1. The channel name is namespaced with the user's id, so two different
 *     accounts on the same device don't share a channel.
 *  2. The postgres_changes filter MUST scope to a column equal to the user's id
 *     (defaults to `user_id=eq.<auth.uid()>`), preventing cross-user payloads.
 *  3. If there is no authenticated user, no subscription is created.
 *  4. The channel is torn down on unmount / user change to avoid leaks.
 */
export interface UseUserRealtimeChannelOptions<T extends Record<string, any> = Record<string, any>> {
  /** Logical channel name. The user id is appended automatically. */
  channelName: string;
  /** Database table to watch (in the public schema). */
  table: string;
  /** Postgres event to listen for. Defaults to '*'. */
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  /**
   * Column on `table` that holds the owning user's id.
   * Defaults to 'user_id'. Set this explicitly when the column is named
   * differently (e.g. 'host_user_id', 'recipient_id').
   */
  userColumn?: string;
  /** Callback invoked for every matching change. */
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void;
  /** Optional gate to disable the subscription without unmounting. */
  enabled?: boolean;
}

export function useUserRealtimeChannel<T extends Record<string, any> = Record<string, any>>({
  channelName,
  table,
  event = '*',
  userColumn = 'user_id',
  onChange,
  enabled = true,
}: UseUserRealtimeChannelOptions<T>) {
  const { user } = useAuth();
  const handlerRef = useRef(onChange);
  handlerRef.current = onChange;

  useEffect(() => {
    if (!enabled || !user?.id) return;

    // Safety: refuse anything that looks unscoped.
    if (!userColumn || typeof userColumn !== 'string') {
      console.error('[useUserRealtimeChannel] userColumn is required for safe scoping');
      return;
    }

    const scopedName = `${channelName}:${user.id}`;
    let channel: RealtimeChannel | null = supabase
      .channel(scopedName)
      .on(
        // @ts-expect-error - supabase-js types for postgres_changes are loose
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter: `${userColumn}=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          handlerRef.current(payload);
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [user?.id, enabled, channelName, table, event, userColumn]);
}

export default useUserRealtimeChannel;

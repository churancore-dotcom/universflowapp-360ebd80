-- Enable RLS on realtime.messages (governs broadcast/presence, NOT postgres_changes)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop any prior policies we may have created
DROP POLICY IF EXISTS "mate room members can read" ON realtime.messages;
DROP POLICY IF EXISTS "mate room members can write" ON realtime.messages;

-- Only authenticated session members/host can SUBSCRIBE to a mate-room:<uuid> topic
CREATE POLICY "mate room members can read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() ~ '^mate-room:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  AND (
    public.is_session_member(substring(realtime.topic() from 11)::uuid, auth.uid())
    OR public.is_session_host(substring(realtime.topic() from 11)::uuid, auth.uid())
  )
);

-- Only authenticated session members/host can BROADCAST/PRESENCE on a mate-room:<uuid> topic
CREATE POLICY "mate room members can write"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() ~ '^mate-room:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  AND (
    public.is_session_member(substring(realtime.topic() from 11)::uuid, auth.uid())
    OR public.is_session_host(substring(realtime.topic() from 11)::uuid, auth.uid())
  )
);
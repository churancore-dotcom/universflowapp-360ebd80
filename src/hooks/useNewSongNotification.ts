import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNewSongNotification = () => {
  const hasPermission = useRef(false);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        hasPermission.current = permission === 'granted';
      });
    } else if (Notification.permission === 'granted') {
      hasPermission.current = true;
    }

    // Listen for new songs
    const channel = supabase
      .channel('new-songs-notification')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'songs',
        },
        (payload) => {
          const newSong = payload.new as { title: string; artist: string; cover_url?: string; is_visible: boolean };
          
          if (!newSong.is_visible) return;
          
          // Show in-app toast
          toast.success('🎵 New Music Added!', {
            description: `${newSong.title} by ${newSong.artist}`,
            duration: 5000,
          });

          // Show browser notification if permitted
          if (hasPermission.current && 'Notification' in window) {
            const notification = new Notification('🎵 New Music Added!', {
              body: `${newSong.title} by ${newSong.artist}`,
              icon: newSong.cover_url || '/placeholder.svg',
              badge: '/favicon.ico',
              tag: 'new-song',
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      hasPermission.current = permission === 'granted';
      return permission === 'granted';
    }
    return false;
  };

  return { requestPermission };
};

// Widget Bridge for Android Home Screen Widgets
// This module provides a bridge between the web app and native Android widgets

/**
 * Check if we're running in a Capacitor Android environment with widget support
 */
export function isWidgetBridgeAvailable(): boolean {
  return typeof (window as any).Capacitor !== 'undefined' && 
         (window as any).Capacitor.getPlatform?.() === 'android' &&
         typeof (window as any).Capacitor.Plugins?.WidgetBridge !== 'undefined';
}

/**
 * Get the widget bridge plugin
 */
function getWidgetBridge() {
  if (!isWidgetBridgeAvailable()) {
    return null;
  }
  return (window as any).Capacitor.Plugins.WidgetBridge;
}

/**
 * Update the Now Playing widget with current playback state
 */
export async function updateNowPlayingWidget(data: {
  title: string;
  artist: string;
  isPlaying: boolean;
  progress: number; // 0-100
  coverUrl?: string;
}): Promise<void> {
  const bridge = getWidgetBridge();
  if (!bridge) return;

  try {
    await bridge.updateNowPlaying(data);
  } catch (error) {
    console.error('Failed to update Now Playing widget:', error);
  }
}

/**
 * Update the Favorites widget with user's liked songs
 */
export async function updateFavoritesWidget(favorites: Array<{
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
}>): Promise<void> {
  const bridge = getWidgetBridge();
  if (!bridge) return;

  try {
    await bridge.updateFavorites({
      favorites: JSON.stringify(favorites.slice(0, 6))
    });
  } catch (error) {
    console.error('Failed to update Favorites widget:', error);
  }
}

/**
 * Force refresh all widgets
 */
export async function refreshAllWidgets(): Promise<void> {
  const bridge = getWidgetBridge();
  if (!bridge) return;

  try {
    await bridge.refreshWidgets();
  } catch (error) {
    console.error('Failed to refresh widgets:', error);
  }
}

/**
 * Listen for widget action events (play/pause, next, previous, etc.)
 * Call this once during app initialization
 */
export function setupWidgetEventListeners(handlers: {
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onShuffleAll?: () => void;
  onShuffleFavorites?: () => void;
  onPlaySong?: (songId: string) => void;
}): () => void {
  if (typeof (window as any).Capacitor === 'undefined') {
    return () => {};
  }

  const handleAppUrlOpen = (event: CustomEvent<{ url: string }>) => {
    const url = event.detail?.url;
    if (!url) return;

    // Handle deep links from widgets
    if (url.includes('WIDGET_PLAY_PAUSE')) {
      handlers.onPlayPause?.();
    } else if (url.includes('WIDGET_NEXT')) {
      handlers.onNext?.();
    } else if (url.includes('WIDGET_PREVIOUS')) {
      handlers.onPrevious?.();
    } else if (url.includes('WIDGET_SHUFFLE_ALL')) {
      handlers.onShuffleAll?.();
    } else if (url.includes('WIDGET_SHUFFLE_FAVORITES')) {
      handlers.onShuffleFavorites?.();
    } else if (url.includes('WIDGET_PLAY_SONG')) {
      const songId = new URL(url).searchParams.get('song_id');
      if (songId) {
        handlers.onPlaySong?.(songId);
      }
    }
  };

  // Listen for Capacitor app URL open events
  document.addEventListener('appUrlOpen', handleAppUrlOpen as EventListener);

  // Return cleanup function
  return () => {
    document.removeEventListener('appUrlOpen', handleAppUrlOpen as EventListener);
  };
}

export default {
  isWidgetBridgeAvailable,
  updateNowPlayingWidget,
  updateFavoritesWidget,
  refreshAllWidgets,
  setupWidgetEventListeners,
};
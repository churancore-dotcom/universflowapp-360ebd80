package app.lovable.universflow.widgets;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.IBinder;
import android.os.Build;

/**
 * Background service that listens for playback state updates 
 * and refreshes widgets accordingly.
 */
public class WidgetUpdateService extends Service {

    public static final String ACTION_UPDATE_PLAYBACK = "app.lovable.universflow.UPDATE_PLAYBACK";
    public static final String ACTION_UPDATE_FAVORITES = "app.lovable.universflow.UPDATE_FAVORITES";

    private BroadcastReceiver updateReceiver;

    @Override
    public void onCreate() {
        super.onCreate();
        
        updateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if (action == null) return;
                
                switch (action) {
                    case ACTION_UPDATE_PLAYBACK:
                        String title = intent.getStringExtra("title");
                        String artist = intent.getStringExtra("artist");
                        boolean isPlaying = intent.getBooleanExtra("is_playing", false);
                        int progress = intent.getIntExtra("progress", 0);
                        
                        NowPlayingWidget.updatePlaybackState(
                            context, title, artist, isPlaying, progress, null
                        );
                        break;
                        
                    case ACTION_UPDATE_FAVORITES:
                        String favoritesJson = intent.getStringExtra("favorites");
                        if (favoritesJson != null) {
                            FavoritesWidget.updateFavorites(context, favoritesJson);
                        }
                        break;
                }
            }
        };
        
        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_UPDATE_PLAYBACK);
        filter.addAction(ACTION_UPDATE_FAVORITES);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(updateReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(updateReceiver, filter);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (updateReceiver != null) {
            unregisterReceiver(updateReceiver);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }
}
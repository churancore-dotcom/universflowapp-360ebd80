package app.lovable.universflow.widgets;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.net.URL;
import java.io.InputStream;

/**
 * Capacitor plugin to bridge web app with native Android widgets.
 * This allows JavaScript to update widget state and receive widget events.
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void updateNowPlaying(PluginCall call) {
        String title = call.getString("title", "Not Playing");
        String artist = call.getString("artist", "");
        boolean isPlaying = call.getBoolean("isPlaying", false);
        int progress = call.getInt("progress", 0);
        String coverUrl = call.getString("coverUrl");
        
        Context context = getContext();
        
        // Update widget state
        NowPlayingWidget.updatePlaybackState(context, title, artist, isPlaying, progress, null);
        
        // If cover URL provided, load it async
        if (coverUrl != null && !coverUrl.isEmpty()) {
            loadAlbumArtAsync(context, coverUrl, title, artist, isPlaying, progress);
        }
        
        call.resolve();
    }
    
    @PluginMethod
    public void updateFavorites(PluginCall call) {
        String favoritesJson = call.getString("favorites", "[]");
        Context context = getContext();
        
        FavoritesWidget.updateFavorites(context, favoritesJson);
        
        call.resolve();
    }
    
    @PluginMethod
    public void refreshWidgets(PluginCall call) {
        Context context = getContext();
        
        // Broadcast update to all widget types
        Intent nowPlayingIntent = new Intent(context, NowPlayingWidget.class);
        nowPlayingIntent.setAction("android.appwidget.action.APPWIDGET_UPDATE");
        context.sendBroadcast(nowPlayingIntent);
        
        Intent favoritesIntent = new Intent(context, FavoritesWidget.class);
        favoritesIntent.setAction("android.appwidget.action.APPWIDGET_UPDATE");
        context.sendBroadcast(favoritesIntent);
        
        Intent quickActionsIntent = new Intent(context, QuickActionsWidget.class);
        quickActionsIntent.setAction("android.appwidget.action.APPWIDGET_UPDATE");
        context.sendBroadcast(quickActionsIntent);
        
        call.resolve();
    }
    
    private void loadAlbumArtAsync(Context context, String url, String title, 
            String artist, boolean isPlaying, int progress) {
        new Thread(() -> {
            try {
                URL imageUrl = new URL(url);
                InputStream inputStream = imageUrl.openStream();
                Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                inputStream.close();
                
                // Update widget with album art
                NowPlayingWidget.updatePlaybackState(context, title, artist, isPlaying, progress, bitmap);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }
    
    @Override
    public void load() {
        super.load();
        
        // Start widget update service
        Context context = getContext();
        Intent serviceIntent = new Intent(context, WidgetUpdateService.class);
        context.startService(serviceIntent);
    }
}
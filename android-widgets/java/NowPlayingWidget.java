package app.lovable.universflow.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.widget.RemoteViews;
import com.getcapacitor.BridgeActivity;

public class NowPlayingWidget extends AppWidgetProvider {

    public static final String ACTION_PLAY_PAUSE = "app.lovable.universflow.PLAY_PAUSE";
    public static final String ACTION_NEXT = "app.lovable.universflow.NEXT";
    public static final String ACTION_PREVIOUS = "app.lovable.universflow.PREVIOUS";
    public static final String PREFS_NAME = "UniversFlowWidgetPrefs";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_now_playing);
        
        // Get stored playback state
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String title = prefs.getString("current_title", "Not Playing");
        String artist = prefs.getString("current_artist", "Open app to start");
        boolean isPlaying = prefs.getBoolean("is_playing", false);
        int progress = prefs.getInt("progress", 0);
        
        // Update text views
        views.setTextViewText(R.id.widget_song_title, title);
        views.setTextViewText(R.id.widget_artist_name, artist);
        views.setProgressBar(R.id.widget_progress, 100, progress, false);
        
        // Update play/pause icon
        views.setImageViewResource(R.id.widget_btn_play_pause, 
            isPlaying ? R.drawable.ic_pause : R.drawable.ic_play);
        
        // Set up click intents
        Intent playPauseIntent = new Intent(context, NowPlayingWidget.class);
        playPauseIntent.setAction(ACTION_PLAY_PAUSE);
        PendingIntent playPausePendingIntent = PendingIntent.getBroadcast(context, 0, 
            playPauseIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_btn_play_pause, playPausePendingIntent);
        
        Intent nextIntent = new Intent(context, NowPlayingWidget.class);
        nextIntent.setAction(ACTION_NEXT);
        PendingIntent nextPendingIntent = PendingIntent.getBroadcast(context, 1, 
            nextIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_btn_next, nextPendingIntent);
        
        Intent prevIntent = new Intent(context, NowPlayingWidget.class);
        prevIntent.setAction(ACTION_PREVIOUS);
        PendingIntent prevPendingIntent = PendingIntent.getBroadcast(context, 2, 
            prevIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_btn_previous, prevPendingIntent);
        
        // Open app on album art click
        Intent openAppIntent = new Intent(context, BridgeActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        PendingIntent openAppPendingIntent = PendingIntent.getActivity(context, 3, 
            openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_album_art, openAppPendingIntent);
        views.setOnClickPendingIntent(R.id.widget_song_info, openAppPendingIntent);
        
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        String action = intent.getAction();
        if (action == null) return;
        
        // Send broadcast to the app
        Intent appIntent = new Intent();
        appIntent.setPackage(context.getPackageName());
        
        switch (action) {
            case ACTION_PLAY_PAUSE:
                appIntent.setAction("app.lovable.universflow.WIDGET_PLAY_PAUSE");
                context.sendBroadcast(appIntent);
                break;
            case ACTION_NEXT:
                appIntent.setAction("app.lovable.universflow.WIDGET_NEXT");
                context.sendBroadcast(appIntent);
                break;
            case ACTION_PREVIOUS:
                appIntent.setAction("app.lovable.universflow.WIDGET_PREVIOUS");
                context.sendBroadcast(appIntent);
                break;
        }
    }

    public static void updatePlaybackState(Context context, String title, String artist, 
            boolean isPlaying, int progress, Bitmap albumArt) {
        // Save state to SharedPreferences
        SharedPreferences.Editor editor = context
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit();
        editor.putString("current_title", title);
        editor.putString("current_artist", artist);
        editor.putBoolean("is_playing", isPlaying);
        editor.putInt("progress", progress);
        editor.apply();
        
        // Update all widgets
        Intent intent = new Intent(context, NowPlayingWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        context.sendBroadcast(intent);
    }
}
package app.lovable.universflow.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;
import com.getcapacitor.BridgeActivity;
import org.json.JSONArray;
import org.json.JSONObject;

public class FavoritesWidget extends AppWidgetProvider {

    public static final String ACTION_SHUFFLE_FAVORITES = "app.lovable.universflow.SHUFFLE_FAVORITES";
    public static final String ACTION_PLAY_FAVORITE = "app.lovable.universflow.PLAY_FAVORITE";
    public static final String PREFS_NAME = "UniversFlowWidgetPrefs";
    public static final String EXTRA_SONG_ID = "song_id";

    private static final int[] FAV_CONTAINERS = {
        R.id.widget_fav_1, R.id.widget_fav_2, R.id.widget_fav_3,
        R.id.widget_fav_4, R.id.widget_fav_5, R.id.widget_fav_6
    };

    private static final int[] FAV_IMAGES = {
        R.id.widget_fav_1_art, R.id.widget_fav_2_art, R.id.widget_fav_3_art,
        R.id.widget_fav_4_art, R.id.widget_fav_5_art
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_favorites);
        
        // Get stored favorites
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String favoritesJson = prefs.getString("favorites", "[]");
        
        try {
            JSONArray favorites = new JSONArray(favoritesJson);
            
            // Update favorite slots (first 5)
            for (int i = 0; i < 5; i++) {
                if (i < favorites.length()) {
                    JSONObject song = favorites.getJSONObject(i);
                    String songId = song.getString("id");
                    
                    // Set click to play this song
                    Intent playIntent = new Intent(context, FavoritesWidget.class);
                    playIntent.setAction(ACTION_PLAY_FAVORITE);
                    playIntent.putExtra(EXTRA_SONG_ID, songId);
                    playIntent.setData(Uri.parse("song://" + songId)); // Unique URI
                    PendingIntent playPendingIntent = PendingIntent.getBroadcast(context, i, 
                        playIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                    views.setOnClickPendingIntent(FAV_CONTAINERS[i], playPendingIntent);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // Shuffle button
        Intent shuffleIntent = new Intent(context, FavoritesWidget.class);
        shuffleIntent.setAction(ACTION_SHUFFLE_FAVORITES);
        PendingIntent shufflePendingIntent = PendingIntent.getBroadcast(context, 10, 
            shuffleIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_shuffle_favorites, shufflePendingIntent);
        
        // See All / Slot 6 opens library
        Intent libraryIntent = new Intent(context, BridgeActivity.class);
        libraryIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        libraryIntent.setData(Uri.parse("universflow://library"));
        PendingIntent libraryPendingIntent = PendingIntent.getActivity(context, 11, 
            libraryIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(FAV_CONTAINERS[5], libraryPendingIntent);
        
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        String action = intent.getAction();
        if (action == null) return;
        
        Intent appIntent = new Intent();
        appIntent.setPackage(context.getPackageName());
        
        switch (action) {
            case ACTION_SHUFFLE_FAVORITES:
                appIntent.setAction("app.lovable.universflow.WIDGET_SHUFFLE_FAVORITES");
                context.sendBroadcast(appIntent);
                break;
            case ACTION_PLAY_FAVORITE:
                String songId = intent.getStringExtra(EXTRA_SONG_ID);
                if (songId != null) {
                    appIntent.setAction("app.lovable.universflow.WIDGET_PLAY_SONG");
                    appIntent.putExtra(EXTRA_SONG_ID, songId);
                    context.sendBroadcast(appIntent);
                }
                break;
        }
    }

    public static void updateFavorites(Context context, String favoritesJson) {
        SharedPreferences.Editor editor = context
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit();
        editor.putString("favorites", favoritesJson);
        editor.apply();
        
        // Trigger widget update
        Intent intent = new Intent(context, FavoritesWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        context.sendBroadcast(intent);
    }
}
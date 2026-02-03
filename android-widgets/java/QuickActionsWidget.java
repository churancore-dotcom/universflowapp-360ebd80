package app.lovable.universflow.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;
import com.getcapacitor.BridgeActivity;

public class QuickActionsWidget extends AppWidgetProvider {

    public static final String ACTION_SHUFFLE_ALL = "app.lovable.universflow.SHUFFLE_ALL";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quick_actions);
        
        // Open App
        Intent openAppIntent = new Intent(context, BridgeActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        PendingIntent openAppPendingIntent = PendingIntent.getActivity(context, 0, 
            openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_open_app, openAppPendingIntent);
        
        // Search - deep link
        Intent searchIntent = new Intent(context, BridgeActivity.class);
        searchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        searchIntent.setData(Uri.parse("universflow://search"));
        PendingIntent searchPendingIntent = PendingIntent.getActivity(context, 1, 
            searchIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_search, searchPendingIntent);
        
        // Shuffle All
        Intent shuffleIntent = new Intent(context, QuickActionsWidget.class);
        shuffleIntent.setAction(ACTION_SHUFFLE_ALL);
        PendingIntent shufflePendingIntent = PendingIntent.getBroadcast(context, 2, 
            shuffleIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_shuffle_all, shufflePendingIntent);
        
        // Recent - deep link to home
        Intent recentIntent = new Intent(context, BridgeActivity.class);
        recentIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        recentIntent.setData(Uri.parse("universflow://home"));
        PendingIntent recentPendingIntent = PendingIntent.getActivity(context, 3, 
            recentIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_recent, recentPendingIntent);
        
        // Library - deep link
        Intent libraryIntent = new Intent(context, BridgeActivity.class);
        libraryIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        libraryIntent.setData(Uri.parse("universflow://library"));
        PendingIntent libraryPendingIntent = PendingIntent.getActivity(context, 4, 
            libraryIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_library, libraryPendingIntent);
        
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        String action = intent.getAction();
        if (ACTION_SHUFFLE_ALL.equals(action)) {
            Intent appIntent = new Intent();
            appIntent.setPackage(context.getPackageName());
            appIntent.setAction("app.lovable.universflow.WIDGET_SHUFFLE_ALL");
            context.sendBroadcast(appIntent);
        }
    }
}
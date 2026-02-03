# UniversFlow Android Widgets Setup

This folder contains native Android widget implementations for your music app.

## Widget Types Included

1. **Now Playing Widget** - Shows current song with album art and playback controls
2. **Favorites Widget** - Quick access grid to your liked songs  
3. **Quick Actions Widget** - Buttons for Search, Shuffle, and Recent plays

## Installation Instructions

After exporting your project to GitHub and running `npx cap add android`, follow these steps:

### Step 1: Copy Layout Files

Copy all files from `android-widgets/res/layout/` to:
```
android/app/src/main/res/layout/
```

### Step 2: Copy Widget Metadata

Copy all files from `android-widgets/res/xml/` to:
```
android/app/src/main/res/xml/
```

### Step 3: Copy Drawable Resources

Copy all files from `android-widgets/res/drawable/` to:
```
android/app/src/main/res/drawable/
```

### Step 4: Copy Widget Provider Classes

Copy all files from `android-widgets/java/` to:
```
android/app/src/main/java/app/lovable/universflow/widgets/
```

### Step 5: Update AndroidManifest.xml

Add the following inside the `<application>` tag in `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Now Playing Widget -->
<receiver
    android:name=".widgets.NowPlayingWidget"
    android:exported="true"
    android:label="Now Playing">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/now_playing_widget_info" />
</receiver>

<!-- Favorites Widget -->
<receiver
    android:name=".widgets.FavoritesWidget"
    android:exported="true"
    android:label="Favorites">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/favorites_widget_info" />
</receiver>

<!-- Quick Actions Widget -->
<receiver
    android:name=".widgets.QuickActionsWidget"
    android:exported="true"
    android:label="Quick Actions">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/quick_actions_widget_info" />
</receiver>

<!-- Widget Update Service -->
<service
    android:name=".widgets.WidgetUpdateService"
    android:exported="false" />
```

### Step 6: Build and Test

1. Run `npx cap sync android`
2. Run `npx cap run android` or build via GitHub Actions

## Widget Sizes

- **Now Playing Widget**: 4x2 cells (resizable)
- **Favorites Widget**: 4x3 cells (resizable)
- **Quick Actions Widget**: 4x1 cells

## How It Works

The widgets communicate with the web app via:
1. **Broadcast Intents** - For play/pause/skip commands
2. **SharedPreferences** - For storing current playback state
3. **Deep Links** - For opening specific app sections

The Capacitor bridge updates widget data when playback state changes.

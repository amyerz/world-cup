package com.erz.worldcup;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Thin full-screen WebView host for the bundled World Cup 2026 web app.
 *
 * The web app lives in assets/www/ (produced by ../../web/build.mjs) and is loaded
 * over file:// so it runs fully offline. The Portal's persistent ~64dp top overlay
 * is handled entirely in CSS (a fixed --portal-top-inset band + dark scrim), so this
 * Activity stays minimal — it just configures the WebView and routes external links
 * (broadcaster "where to watch" pages) out to the system browser.
 */
public class MainActivity extends Activity {

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Lay out edge-to-edge so the web app's own CSS controls the top band.
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);     // localStorage "wc26.v2" + API cache
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);       // file:///android_asset
        s.setAllowContentAccess(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Surface page console.* to logcat under tag "WCWeb" for debugging.
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                Log.i("WCWeb", m.message() + " (" + m.sourceId() + ":" + m.lineNumber() + ")");
                return true;
            }
        });

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                String scheme = u.getScheme();
                if ("http".equals(scheme) || "https".equals(scheme)) {
                    // Broadcaster / external links -> system browser; keep file:// inside the WebView.
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, u));
                    } catch (Exception ignored) {
                    }
                    return true;
                }
                return false;
            }
        });

        setContentView(web);
        web.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

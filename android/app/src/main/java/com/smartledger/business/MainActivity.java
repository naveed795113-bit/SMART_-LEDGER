package com.smartledger.business;

import android.Manifest;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import com.googlecode.tesseract.android.TessBaseAPI;
import org.json.JSONObject;
import android.app.Activity;
import android.print.PrintManager;
import android.print.PrintAttributes;
import android.content.ContentValues;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import android.content.Intent;
import android.content.ClipData;
import androidx.core.content.FileProvider;
import androidx.core.content.ContextCompat;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialException;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebResourceResponse;
import androidx.webkit.WebViewAssetLoader;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

public class MainActivity extends Activity {
    // OAuth Web client ID is the server client ID used to mint Google ID tokens.
    private static final String GOOGLE_WEB_CLIENT_ID = "600259265217-dgavke1sfnafsa5u7h2kbu98cq6qvhb3.apps.googleusercontent.com";
    private static final int FILE_CHOOSER_REQUEST = 4101;
    private static final int CAMERA_PERMISSION_REQUEST = 4102;
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingPermission;
    private WebViewAssetLoader assetLoader;
    private final ExecutorService ocrExecutor = Executors.newSingleThreadExecutor();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        window.setStatusBarColor(0xFF1A1A1A);
        window.setNavigationBarColor(0xFF1A1A1A);
        window.getDecorView().setSystemUiVisibility(0);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF1A1A1A);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(false);
        settings.setLoadsImagesAutomatically(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        CookieManager.getInstance().setAcceptCookie(true);

        assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                String bridge = "(function(){if(window.__smartLedgerNativeReady)return;window.__smartLedgerNativeReady=true;window.print=function(){SmartLedgerNative.printPage()};document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[download]'):null;if(!a||!a.href||!a.href.startsWith('blob:'))return;e.preventDefault();var name=a.download||'SmartLedger-export';fetch(a.href).then(function(r){return r.blob()}).then(function(b){var fr=new FileReader();fr.onload=function(){SmartLedgerNative.saveFile(name,b.type||'application/octet-stream',String(fr.result).split(',')[1]||'')};fr.readAsDataURL(b)}).catch(function(){alert('Could not prepare this download. Please try again.')})},true);if(!window.__slBackInstalled){window.__slBackInstalled=true;window.__slPageStack=[];var originalGo=window.go;if(typeof originalGo==='function'){window.go=function(next){var active=document.querySelector('#nav button.active, #mobileNav button.active, .mobile-nav button.active');var current=active&&active.dataset.page;if(current&&current!==next){window.__slPageStack.push(current);if(window.__slPageStack.length>30)window.__slPageStack.shift()}return originalGo.apply(this,arguments)}}window.SmartLedgerHandleBack=function(){var modal=document.getElementById('modal');if(modal&&modal.classList.contains('show')){if(typeof window.closeModal==='function')window.closeModal();else modal.classList.remove('show');return true}var previous=window.__slPageStack.pop();if(previous&&typeof window.go==='function'){window.go(previous);return true}var active=document.querySelector('#nav button.active, #mobileNav button.active, .mobile-nav button.active');var current=active&&active.dataset.page;if(current&&current!=='Dashboard'&&typeof window.go==='function'){window.__slPageStack.length=0;window.go('Dashboard');return true}return false}}})();";
                view.evaluateJavascript(bridge, null);
            }

            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && "appassets.androidplatform.net".equals(uri.getHost())) return false;
                if ("https".equals(uri.getScheme()) || "mailto".equals(uri.getScheme()) || "tel".equals(uri.getScheme())) {
                    if ("https".equals(uri.getScheme()) && uri.getHost() != null &&
                        (uri.getHost().equals("appassets.androidplatform.net"))) return false;
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
                    return true;
                }
                return true;
            }
        });

        webView.addJavascriptInterface(new NativeBridge(), "SmartLedgerNative");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    Intent intent = params.createIntent();
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception e) {
                    if (fileCallback != null) fileCallback.onReceiveValue(null);
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "File picker could not be opened", Toast.LENGTH_LONG).show();
                    return true;
                }
            }

            @Override public void onPermissionRequest(PermissionRequest request) {
                boolean asksCamera = false;
                for (String resource : request.getResources()) {
                    if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) asksCamera = true;
                }
                if (!asksCamera) { request.deny(); return; }
                if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                    request.grant(request.getResources());
                } else {
                    pendingPermission = request;
                    requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST);
                }
            }
        });

        setContentView(webView);
        if (savedInstanceState == null) {
            webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html");
        } else {
            webView.restoreState(savedInstanceState);
        }
    }


    private File prepareOcrData(String language) throws Exception {
        File root = new File(getFilesDir(), "smartledger-ocr");
        File tessdata = new File(root, "tessdata");
        if (!tessdata.exists() && !tessdata.mkdirs()) throw new Exception("Cannot create OCR data folder");
        for (String code : language.split("\\+")) {
            if (!code.matches("eng|hin|urd")) throw new Exception("Unsupported OCR language");
            File target = new File(tessdata, code + ".traineddata");
            if (target.exists() && target.length() > 0) continue;
            File temp = new File(tessdata, code + ".traineddata.tmp");
            try (InputStream input = getAssets().open("tessdata/" + code + ".traineddata");
                 OutputStream output = new FileOutputStream(temp)) {
                byte[] buffer = new byte[64 * 1024];
                int count;
                while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                output.flush();
            }
            if (target.exists() && !target.delete()) throw new Exception("Cannot replace OCR language data");
            if (!temp.renameTo(target)) throw new Exception("Cannot install OCR language data");
        }
        return root;
    }

    private void deliverGoogleAuthResult(String callbackId, String idToken, String error) {
        if (webView == null) return;
        String script = "if(window.SmartLedgerGoogleAuth&&window.SmartLedgerGoogleAuth.resolve){window.SmartLedgerGoogleAuth.resolve("
                + JSONObject.quote(callbackId == null ? "" : callbackId) + ","
                + JSONObject.quote(idToken == null ? "" : idToken) + ","
                + JSONObject.quote(error == null ? "" : error) + ")}";
        runOnUiThread(() -> { if (webView != null) webView.evaluateJavascript(script, null); });
    }

    private void deliverOcrResult(String callbackId, String text, String error) {
        if (webView == null) return;
        String script = "if(window.SmartLedgerOCR&&window.SmartLedgerOCR.resolve){window.SmartLedgerOCR.resolve("
                + JSONObject.quote(callbackId == null ? "" : callbackId) + ","
                + JSONObject.quote(text == null ? "" : text) + ","
                + JSONObject.quote(error == null ? "" : error) + ")}";
        runOnUiThread(() -> { if (webView != null) webView.evaluateJavascript(script, null); });
    }

    private void deliverShareResult(String callbackId, String error) {
        if (webView == null) return;
        String script = "if(window.SmartLedgerShare&&window.SmartLedgerShare.resolve){window.SmartLedgerShare.resolve("
                + JSONObject.quote(callbackId == null ? "" : callbackId) + ","
                + JSONObject.quote(error == null ? "" : error) + ")}";
        runOnUiThread(() -> { if (webView != null) webView.evaluateJavascript(script, null); });
    }

    private File writeShareFile(File directory, String name, String encoded) throws Exception {
        byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
        if (bytes.length == 0 || bytes.length > 25 * 1024 * 1024) {
            throw new Exception("Invoice attachment is empty or too large.");
        }
        File target = new File(directory, name);
        try (FileOutputStream output = new FileOutputStream(target)) {
            output.write(bytes);
            output.flush();
        }
        return target;
    }

    private class NativeBridge {
        @JavascriptInterface
        public void signInWithGoogle(String callbackId) {
            runOnUiThread(() -> {
                try {
                    GetGoogleIdOption googleOption = new GetGoogleIdOption.Builder()
                            .setFilterByAuthorizedAccounts(false)
                            .setServerClientId(GOOGLE_WEB_CLIENT_ID)
                            .setAutoSelectEnabled(false)
                            .build();
                    GetCredentialRequest request = new GetCredentialRequest.Builder()
                            .addCredentialOption(googleOption)
                            .build();
                    CredentialManager manager = CredentialManager.create(MainActivity.this);
                    manager.getCredentialAsync(MainActivity.this, request, null,
                            ContextCompat.getMainExecutor(MainActivity.this),
                            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                                @Override public void onResult(GetCredentialResponse response) {
                                    try {
                                        Credential credential = response.getCredential();
                                        if (!(credential instanceof androidx.credentials.CustomCredential)
                                                || !GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                                            deliverGoogleAuthResult(callbackId, "", "Google did not return a valid sign-in credential. Please try again.");
                                            return;
                                        }
                                        GoogleIdTokenCredential googleCredential =
                                                GoogleIdTokenCredential.createFrom(credential.getData());
                                        String token = googleCredential.getIdToken();
                                        if (token == null || token.isEmpty()) {
                                            deliverGoogleAuthResult(callbackId, "", "Google returned an empty sign-in token. Please try again.");
                                            return;
                                        }
                                        deliverGoogleAuthResult(callbackId, token, "");
                                    } catch (Exception error) {
                                        deliverGoogleAuthResult(callbackId, "", error.getMessage() == null
                                                ? "Could not read the Google sign-in response." : error.getMessage());
                                    }
                                }

                                @Override public void onError(GetCredentialException error) {
                                    String message = error == null || error.getMessage() == null
                                            ? "Google sign-in was cancelled or could not be completed."
                                            : error.getMessage();
                                    deliverGoogleAuthResult(callbackId, "", message);
                                }
                            });
                } catch (Exception error) {
                    deliverGoogleAuthResult(callbackId, "", error.getMessage() == null
                            ? "Google sign-in could not start on this device." : error.getMessage());
                }
            });
        }

        @JavascriptInterface
        public void shareFilesToWhatsApp(String pdfBase64, String imageBase64, String phone,
                                         String message, String fileStem, String callbackId) {
            try {
                String digits = phone == null ? "" : phone.replaceAll("\\D", "");
                if (digits.length() < 10 || digits.length() > 15) {
                    throw new Exception("Enter the customer's full phone number with country code.");
                }
                String whatsapp = getPackageManager().getLaunchIntentForPackage("com.whatsapp") != null
                        ? "com.whatsapp"
                        : (getPackageManager().getLaunchIntentForPackage("com.whatsapp.w4b") != null
                            ? "com.whatsapp.w4b" : null);
                if (whatsapp == null) throw new Exception("WhatsApp is not installed on this device.");
                if (pdfBase64 == null || imageBase64 == null
                        || pdfBase64.length() > 36000000 || imageBase64.length() > 36000000) {
                    throw new Exception("Invoice attachments are too large to share.");
                }
                File directory = new File(getCacheDir(), "shared-invoices");
                if (!directory.exists() && !directory.mkdirs()) throw new Exception("Cannot prepare invoice attachments.");
                String safeStem = (fileStem == null ? "SmartLedger-Invoice" : fileStem)
                        .replaceAll("[^A-Za-z0-9._-]", "-");
                if (safeStem.length() > 80) safeStem = safeStem.substring(0, 80);
                File pdfFile = writeShareFile(directory, safeStem + ".pdf", pdfBase64);
                File imageFile = writeShareFile(directory, safeStem + "-HD.png", imageBase64);
                Uri pdfUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", pdfFile);
                Uri imageUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", imageFile);
                ArrayList<Uri> attachments = new ArrayList<>();
                attachments.add(pdfUri);
                attachments.add(imageUri);
                Intent share = new Intent(Intent.ACTION_SEND_MULTIPLE);
                share.setPackage(whatsapp);
                share.setType("*/*");
                share.putParcelableArrayListExtra(Intent.EXTRA_STREAM, attachments);
                share.putExtra(Intent.EXTRA_TEXT, message == null ? "" : message);
                share.putExtra("jid", digits + "@s.whatsapp.net");
                share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                ClipData clip = ClipData.newUri(getContentResolver(), "SmartLedger invoice", pdfUri);
                clip.addItem(new ClipData.Item(imageUri));
                share.setClipData(clip);
                runOnUiThread(() -> {
                    try {
                        startActivity(share);
                        deliverShareResult(callbackId, "");
                    } catch (Exception error) {
                        deliverShareResult(callbackId, error.getMessage() == null ? "WhatsApp could not open the invoice." : error.getMessage());
                    }
                });
            } catch (Throwable error) {
                deliverShareResult(callbackId, error.getMessage() == null ? "WhatsApp invoice sharing failed." : error.getMessage());
            }
        }

        @JavascriptInterface
        public void shareSingleInvoiceFile(String encoded, String mimeType, String fileName,
                                            String phone, String message, String callbackId) {
            try {
                String digits = phone == null ? "" : phone.replaceAll("\\D", "");
                if (digits.length() < 10 || digits.length() > 15) {
                    throw new Exception("Enter the customer's full phone number with country code.");
                }
                String type = mimeType == null ? "application/pdf" : mimeType;
                if (!type.equals("application/pdf") && !type.equals("image/png")) {
                    throw new Exception("Unsupported invoice attachment type.");
                }
                if (encoded == null || encoded.length() > 36000000) {
                    throw new Exception("Invoice attachment is too large to share.");
                }
                String whatsapp = getPackageManager().getLaunchIntentForPackage("com.whatsapp") != null
                        ? "com.whatsapp"
                        : (getPackageManager().getLaunchIntentForPackage("com.whatsapp.w4b") != null
                            ? "com.whatsapp.w4b" : null);
                if (whatsapp == null) throw new Exception("WhatsApp is not installed on this device.");
                File directory = new File(getCacheDir(), "shared-invoices");
                if (!directory.exists() && !directory.mkdirs()) throw new Exception("Cannot prepare invoice attachment.");
                String safeName = (fileName == null ? "SmartLedger-Invoice" : fileName)
                        .replaceAll("[^A-Za-z0-9._-]", "-");
                if (safeName.length() > 100) safeName = safeName.substring(0, 100);
                File file = writeShareFile(directory, safeName, encoded);
                Uri uri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", file);
                Intent share = new Intent(Intent.ACTION_SEND);
                share.setPackage(whatsapp);
                share.setType(type);
                share.putExtra(Intent.EXTRA_STREAM, uri);
                share.putExtra(Intent.EXTRA_TEXT, message == null ? "" : message);
                share.putExtra("jid", digits + "@s.whatsapp.net");
                share.setClipData(ClipData.newUri(getContentResolver(), "SmartLedger invoice", uri));
                share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                runOnUiThread(() -> {
                    try {
                        startActivity(share);
                        deliverShareResult(callbackId, "");
                    } catch (Exception error) {
                        deliverShareResult(callbackId, error.getMessage() == null
                                ? "WhatsApp could not open the invoice attachment." : error.getMessage());
                    }
                });
            } catch (Throwable error) {
                deliverShareResult(callbackId, error.getMessage() == null
                        ? "Invoice attachment sharing failed." : error.getMessage());
            }
        }

        @JavascriptInterface
        public void recognizeBill(String base64, String language, String callbackId) {
            final String requested = language == null ? "eng" : language;
            if (!requested.matches("eng|hin|urd|eng\\+hin|eng\\+urd|hin\\+urd|eng\\+hin\\+urd")
                    || base64 == null || base64.length() > 12000000) {
                deliverOcrResult(callbackId, "", "Invalid image or unsupported OCR language.");
                return;
            }
            ocrExecutor.execute(() -> {
                Bitmap bitmap = null;
                TessBaseAPI tess = null;
                String recognized = "";
                String failure = "";
                try {
                    byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                    bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                    if (bitmap == null) throw new Exception("The selected file is not a readable image.");
                    if ((long) bitmap.getWidth() * (long) bitmap.getHeight() > 20000000L) {
                        throw new Exception("Image is too large. Select a smaller or clearer bill photo.");
                    }
                    File dataRoot = prepareOcrData(requested);
                    tess = new TessBaseAPI();
                    if (!tess.init(dataRoot.getAbsolutePath(), requested)) {
                        throw new Exception("OCR language data could not be initialized.");
                    }
                    tess.setImage(bitmap);
                    recognized = tess.getUTF8Text();
                    if (recognized == null || recognized.trim().isEmpty()) {
                        throw new Exception("No readable text found. Try a sharper, well-lit photo.");
                    }
                } catch (Throwable error) {
                    failure = error.getMessage() == null ? "Offline OCR failed." : error.getMessage();
                } finally {
                    if (tess != null) tess.recycle();
                    if (bitmap != null && !bitmap.isRecycled()) bitmap.recycle();
                }
                deliverOcrResult(callbackId, recognized, failure);
            });
        }

        @JavascriptInterface
        public void saveFile(String requestedName, String mimeType, String base64) {
            try {
                String safeName = requestedName == null ? "SmartLedger-export" : requestedName.replaceAll("[^A-Za-z0-9._-]", "_");
                if (safeName.isEmpty()) safeName = "SmartLedger-export";
                byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                OutputStream output;
                if (android.os.Build.VERSION.SDK_INT >= 29) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, safeName);
                    values.put(MediaStore.Downloads.MIME_TYPE, mimeType == null ? "application/octet-stream" : mimeType);
                    values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/SmartLedger");
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) throw new Exception("Unable to create download");
                    output = getContentResolver().openOutputStream(uri);
                } else {
                    File folder = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "SmartLedger");
                    if (!folder.exists() && !folder.mkdirs()) throw new Exception("Unable to create download folder");
                    output = new FileOutputStream(new File(folder, safeName));
                }
                if (output == null) throw new Exception("Unable to open download");
                output.write(bytes);
                output.close();
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Saved to Downloads/SmartLedger", Toast.LENGTH_LONG).show());
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Download failed: " + e.getMessage(), Toast.LENGTH_LONG).show());
            }
        }

        @JavascriptInterface
        public void printPage() {
            runOnUiThread(() -> {
                try {
                    PrintManager manager = (PrintManager) getSystemService(PRINT_SERVICE);
                    manager.print("SmartLedger document", webView.createPrintDocumentAdapter("SmartLedger document"), new PrintAttributes.Builder().build());
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Printing is unavailable on this device", Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && fileCallback != null) {
            Uri[] result = null;
            try { result = WebChromeClient.FileChooserParams.parseResult(resultCode, data); }
            catch (Exception ignored) {}
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_REQUEST && pendingPermission != null) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                pendingPermission.grant(pendingPermission.getResources());
            } else pendingPermission.deny();
            pendingPermission = null;
        }
    }

    @Override protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.evaluateJavascript("if(document.body)document.body.classList.remove('printing-invoice')", null);
        }
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override public void onBackPressed() {
        if (webView == null) { super.onBackPressed(); return; }
        webView.evaluateJavascript("(function(){return typeof window.SmartLedgerHandleBack==='function' ? window.SmartLedgerHandleBack() : false})()", value -> {
            if (isFinishing() || isDestroyed()) return;
            if ("true".equals(value)) return;
            if (webView != null && webView.canGoBack()) webView.goBack();
            else MainActivity.super.onBackPressed();
        });
    }

    @Override protected void onDestroy() {
        ocrExecutor.shutdownNow();
        if (fileCallback != null) { fileCallback.onReceiveValue(null); fileCallback = null; }
        if (pendingPermission != null) { try { pendingPermission.deny(); } catch (Exception ignored) {} pendingPermission = null; }
        if (webView != null) { webView.destroy(); webView = null; }
        super.onDestroy();
    }
}

package com.smartledger.business;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import com.googlecode.tesseract.android.TessBaseAPI;

import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Locale;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

@RunWith(AndroidJUnit4.class)
public class OfflineOcrSmokeTest {
    @Test
    public void readsPrintedInvoiceTextWithoutNetwork() throws Exception {
        Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        File root = new File(context.getCacheDir(), "smartledger-ocr-test");
        File tessdata = new File(root, "tessdata");
        assertTrue("OCR data directory could not be created", tessdata.mkdirs() || tessdata.isDirectory());

        File english = new File(tessdata, "eng.traineddata");
        try (InputStream input = context.getAssets().open("tessdata/eng.traineddata");
             FileOutputStream output = new FileOutputStream(english)) {
            byte[] buffer = new byte[64 * 1024];
            int count;
            while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
        }

        TessBaseAPI tess = new TessBaseAPI();
        Bitmap bitmap = Bitmap.createBitmap(1800, 500, Bitmap.Config.ARGB_8888);
        try {
            assertTrue("Tesseract could not load the bundled English model",
                    tess.init(root.getAbsolutePath(), "eng"));
            Canvas canvas = new Canvas(bitmap);
            canvas.drawColor(Color.WHITE);
            Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
            paint.setColor(Color.BLACK);
            paint.setTypeface(Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD));
            paint.setTextSize(120f);
            canvas.drawText("INVOICE TOTAL 12345", 60f, 290f, paint);
            tess.setPageSegMode(7);
            tess.setImage(bitmap);
            String recognized = tess.getUTF8Text();
            assertNotNull("OCR returned no text", recognized);
            String normalized = recognized.toUpperCase(Locale.ROOT).replaceAll("\\s+", " ");
            assertTrue("OCR did not recognize the invoice heading: " + normalized, normalized.contains("INVOICE"));
            assertTrue("OCR did not recognize the invoice number: " + normalized, normalized.contains("12345"));
        } finally {
            tess.recycle();
            bitmap.recycle();
        }
    }
}

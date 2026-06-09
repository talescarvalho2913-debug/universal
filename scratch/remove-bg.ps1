$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class ImageProcessor
{
    public static void ProcessImage(string inputPath, string outputPath)
    {
        using (Bitmap bmp = new Bitmap(inputPath))
        {
            int minX = bmp.Width, minY = bmp.Height, maxX = 0, maxY = 0;
            Bitmap outBmp = new Bitmap(bmp.Width, bmp.Height, PixelFormat.Format32bppArgb);
            
            for (int y = 0; y < bmp.Height; y++)
            {
                for (int x = 0; x < bmp.Width; x++)
                {
                    Color c = bmp.GetPixel(x, y);
                    float dR = c.R - 36;
                    float dG = c.G - 40;
                    float dB = c.B - 67;
                    float dist = (float)Math.Sqrt(dR*dR + dG*dG + dB*dB);
                    
                    float alpha = Math.Min(1.0f, dist / 80.0f);
                    // Smoothstep
                    alpha = alpha * alpha * (3 - 2 * alpha);
                    
                    if (alpha < 0.05f)
                    {
                        outBmp.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                    }
                    else
                    {
                        int origR = (int)Math.Min(255, Math.Max(0, (c.R - 36 * (1 - alpha)) / alpha));
                        int origG = (int)Math.Min(255, Math.Max(0, (c.G - 40 * (1 - alpha)) / alpha));
                        int origB = (int)Math.Min(255, Math.Max(0, (c.B - 67 * (1 - alpha)) / alpha));
                        
                        outBmp.SetPixel(x, y, Color.FromArgb((int)(alpha * 255), origR, origG, origB));
                        
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            
            if (minX <= maxX && minY <= maxY)
            {
                // add a small padding of 5 pixels
                minX = Math.Max(0, minX - 5);
                minY = Math.Max(0, minY - 5);
                maxX = Math.Min(bmp.Width - 1, maxX + 5);
                maxY = Math.Min(bmp.Height - 1, maxY + 5);
                
                Rectangle rect = new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
                using (Bitmap cropped = outBmp.Clone(rect, outBmp.PixelFormat))
                {
                    cropped.Save(outputPath, ImageFormat.Png);
                    Console.WriteLine("Processed and cropped to: " + rect.Width + "x" + rect.Height);
                }
            }
            else
            {
                Console.WriteLine("No visible pixels found.");
            }
            outBmp.Dispose();
        }
    }
}
"@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[ImageProcessor]::ProcessImage("C:\Users\User\.gemini\antigravity\brain\2b32851e-71fe-47b2-a0f8-83c9c2aeb9c4\media__1780971916392.png", "C:\Users\User\Desktop\OFERTAS TT\UNIVERSAL\public\assets\logo-header.png")

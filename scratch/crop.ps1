$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class ImageCropper
{
    public static void CropTransparent(string path, string outPath)
    {
        using (Bitmap bmp = new Bitmap(path))
        {
            int minX = bmp.Width, minY = bmp.Height, maxX = 0, maxY = 0;
            for (int y = 0; y < bmp.Height; y++)
            {
                for (int x = 0; x < bmp.Width; x++)
                {
                    Color c = bmp.GetPixel(x, y);
                    if (c.A > 10)
                    {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (minX <= maxX && minY <= maxY)
            {
                Rectangle rect = new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
                using (Bitmap cropped = bmp.Clone(rect, bmp.PixelFormat))
                {
                    cropped.Save(outPath, ImageFormat.Png);
                    Console.WriteLine("Cropped to: " + rect.Width + "x" + rect.Height);
                }
            }
            else
            {
                Console.WriteLine("No non-transparent pixels found.");
            }
        }
    }
}
"@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[ImageCropper]::CropTransparent("C:\Users\User\Desktop\OFERTAS TT\UNIVERSAL\public\assets\logo-header.png", "C:\Users\User\Desktop\OFERTAS TT\UNIVERSAL\public\assets\logo-header-cropped.png")

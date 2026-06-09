$code = @"
using System;
using System.Drawing;

public class ImageInfo
{
    public static void GetInfo(string path)
    {
        using (Bitmap bmp = new Bitmap(path))
        {
            Color bg = bmp.GetPixel(0, 0);
            Console.WriteLine("BG Color: R=" + bg.R + " G=" + bg.G + " B=" + bg.B);
        }
    }
}
"@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[ImageInfo]::GetInfo("C:\Users\User\.gemini\antigravity\brain\2b32851e-71fe-47b2-a0f8-83c9c2aeb9c4\media__1780971916392.png")

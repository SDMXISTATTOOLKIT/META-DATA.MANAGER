using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;

namespace Utility
{
    public static class ImageTools
    {
        const string errorMessage = "Can not recognise image format.";

        private static Dictionary<byte[], Func<BinaryReader, Size>> imageFormatDecoders = new Dictionary<byte[], Func<BinaryReader, Size>>()
        {
            { new byte[]{ 0x42, 0x4D }, DecodeBitmap},
            { new byte[]{ 0x47, 0x49, 0x46, 0x38, 0x37, 0x61 }, DecodeGif },
            { new byte[]{ 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 }, DecodeGif },
            { new byte[]{ 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }, DecodePng },
            { new byte[]{ 0xff, 0xd8 }, DecodeJfif },
        };



        public static Image ResizeImg(Image _tmpImage, int w, int h)
        {

            if (w / (float)h > 3) h *= 2;
            else if (h / (float)w > 3) w *= 2;

            Bitmap newImg = new Bitmap(_tmpImage, new Size(w, h));

            _tmpImage.Dispose();

            return newImg;
        }


        public static int[][] GetImageRGBVector(int imgSize, string filePath)
        {
            Image _tmpImg = System.Drawing.Image.FromFile(filePath);

            //resize the image
            Bitmap newImg = new Bitmap(_tmpImg, new Size(imgSize, imgSize));

            _tmpImg.Dispose();

            var bmpData = newImg.LockBits(new Rectangle(0,0, imgSize, imgSize), System.Drawing.Imaging.ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);

            // Get the address of the first line.
            IntPtr ptr = bmpData.Scan0;

            // Declare an array to hold the bytes of the bitmap.
            int bytes = Math.Abs(bmpData.Stride) * newImg.Height;
            byte[] rgbValues = new byte[bytes];

            // Copy the RGB values into the array.
            System.Runtime.InteropServices.Marshal.Copy(ptr, rgbValues, 0, bytes);

            // Unlock the bits.
            newImg.UnlockBits(bmpData);
            newImg.Dispose();

            var res = Enumerable.Range(0, bytes/3).Select(i => new int[] { rgbValues[i*3], rgbValues[i*3 + 1], rgbValues[i*3 + 2] }).ToArray();
            
            return res;
        }

        public static double GetRGBVectorDistance(int[][] img1, int[][] img2)
        {
            return Enumerable.Range(0, img1.Length)
                    .Select(i => new { dR = img1[i][0] - img2[i][0], dG = img1[i][1] - img2[i][1], dB = img1[i][2] - img2[i][2] })
                    .Select(v => Math.Sqrt(v.dR * v.dR + v.dG * v.dG + v.dB * v.dB)).Average();
        }



        public static Image SetWhiteBack(Image _tmpImage)
        {
            Bitmap bmp = new Bitmap(_tmpImage.Width, _tmpImage.Height, PixelFormat.Format32bppArgb);

            Graphics g = Graphics.FromImage(bmp);

            g.Clear(Color.White);

            g.DrawImage(_tmpImage, 0, 0);

            g.Dispose();

            _tmpImage.Dispose();

            return bmp;

        }


        /// <summary>
        /// Gets the dimensions of an image.
        /// </summary>
        /// <param name="path">The path of the image to get the dimensions of.</param>
        /// <returns>The dimensions of the specified image.</returns>
        /// <exception cref="ArgumentException">The image was of an unrecognised format.</exception>
        public static Size GetDimensions(string path)
        {
            try
            {
                //checkBas64(path);

                return GetDimensions_(path);
            }
            catch(ArgumentException)
            {
                //provamos a reconvertirlo
                using (Image img = System.Drawing.Image.FromFile(path))
                {
                    return img.Size;
                }
                
                //img.Save(path + ".jpg", System.Drawing.Imaging.ImageFormat.Jpeg);
            }
        }

        /// <summary>
        /// Gets the dimensions of an image.
        /// </summary>
        /// <param name="path">The path of the image to get the dimensions of.</param>
        /// <returns>The dimensions of the specified image.</returns>
        /// <exception cref="ArgumentException">The image was of an unrecognised format.</exception>
        public static Size GetDimensions_(string path)
        {
            using (BinaryReader binaryReader = new BinaryReader(File.OpenRead(path)))
            {
                try
                {

                    return GetDimensions(binaryReader);
                }
                catch (ArgumentException e)
                {
                    if (e.Message.StartsWith(errorMessage))
                    {
                        throw new ArgumentException(errorMessage, path, e);
                    }
                    else
                    {
                        throw e;
                    }
                }
            }
        }

        /// <summary>
        /// Verifica si està en base64 y eventualmente lo convierte
        /// </summary>
        private static void checkBas64(string path)
        {
            string text = File.ReadAllText(path);

            foreach (char c in text)
            {
                if ((c < '0' || c > '9') && (c < 'A' || c > 'Z') && (c < 'a' || c > 'z') && c != '/' && c != '+' && c != '=')
                    return;
            }

           File.WriteAllBytes(path, Convert.FromBase64String(text));
            
        }

        /// <summary>
        /// Gets the dimensions of an image.
        /// </summary>
        /// <param name="path">The path of the image to get the dimensions of.</param>
        /// <returns>The dimensions of the specified image.</returns>
        /// <exception cref="ArgumentException">The image was of an unrecognised format.</exception>    
        public static Size GetDimensions(BinaryReader binaryReader)
        {
            int maxMagicBytesLength = imageFormatDecoders.Keys.OrderByDescending(x => x.Length).First().Length;

            byte[] magicBytes = new byte[maxMagicBytesLength];

            for (int i = 0; i < maxMagicBytesLength; i += 1)
            {
                magicBytes[i] = binaryReader.ReadByte();

                foreach (var kvPair in imageFormatDecoders)
                {
                    if (magicBytes.StartsWith(kvPair.Key))
                    {
                        return kvPair.Value(binaryReader);
                    }
                }
            }

            throw new ArgumentException(errorMessage, "binaryReader");
        }

        private static bool StartsWith(this byte[] thisBytes, byte[] thatBytes)
        {
            for (int i = 0; i < thatBytes.Length; i += 1)
            {
                if (thisBytes[i] != thatBytes[i])
                {
                    return false;
                }
            }
            return true;
        }

        private static short ReadBigEndianInt16(this BinaryReader binaryReader)
        {
            byte[] bytes = new byte[sizeof(short)];
            for (int i = 0; i < sizeof(short); i += 1)
            {
                bytes[sizeof(short) - 1 - i] = binaryReader.ReadByte();
            }
            return BitConverter.ToInt16(bytes, 0);
        }

        private static int ReadBigEndianInt32(this BinaryReader binaryReader)
        {
            byte[] bytes = new byte[sizeof(int)];
            for (int i = 0; i < sizeof(int); i += 1)
            {
                bytes[sizeof(int) - 1 - i] = binaryReader.ReadByte();
            }
            return BitConverter.ToInt32(bytes, 0);
        }

        private static Size DecodeBitmap(BinaryReader binaryReader)
        {
            binaryReader.ReadBytes(16);
            int width = binaryReader.ReadInt32();
            int height = binaryReader.ReadInt32();
            return new Size(width, height);
        }

        private static Size DecodeGif(BinaryReader binaryReader)
        {
            int width = binaryReader.ReadInt16();
            int height = binaryReader.ReadInt16();
            return new Size(width, height);
        }

        private static Size DecodePng(BinaryReader binaryReader)
        {
            binaryReader.ReadBytes(8);
            int width = binaryReader.ReadBigEndianInt32();
            int height = binaryReader.ReadBigEndianInt32();
            return new Size(width, height);
        }

 
        private static Size DecodeJfif(BinaryReader binaryReader)
        {
            while (binaryReader.ReadByte() == 0xff)
            {
                byte marker = binaryReader.ReadByte();
                short chunkLength = binaryReader.ReadBigEndianInt16();

                //http://dev.exiv2.org/projects/exiv2/wiki/The_Metadata_in_JPEG_files
                if (marker == 0xc0 || marker == 0xc2)
                {
                    binaryReader.ReadByte();

                    int height = binaryReader.ReadBigEndianInt16();
                    int width = binaryReader.ReadBigEndianInt16();
                    return new Size(width, height);
                }

                if (chunkLength > 2)
                    binaryReader.ReadBytes(chunkLength - 2);
                else
                    break; // lanzar excepcion
            }

            throw new ArgumentException(errorMessage);
        }
        
    }
}
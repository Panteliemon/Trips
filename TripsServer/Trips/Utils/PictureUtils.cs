using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities.Pics;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.Primitives;

namespace Trips.Utils
{
    public static class PictureUtils
    {
        public class GalleryProcessResult
        {
            public GalleryProcessResult(byte[] miniature, DateTime? dateTaken, int height, int width)
            {
                Miniature = miniature;
                DateTaken = dateTaken;
                Height = height;
                Width = width;
            }

            public byte[] Miniature { get; }
            public DateTime? DateTaken { get; }
            public int Height { get; }
            public int Width { get; }
        }


        /// <summary>
        /// Max acceptable file size for images
        /// </summary>
        public const long MAX_FILESIZE = 16 * 1024 * 1024;

        public const int AVATAR_MAX_SIZE = 400;
        public const int GALLERY_MINIATURE_SIZE = 250;

        public static string GetMimeTypeFor(PicFormat supportedFormat)
        {
            switch (supportedFormat)
            {
                case PicFormat.Jpeg:
                    return "image/jpeg";
                case PicFormat.Png:
                    return "image/png";
                case PicFormat.Bmp:
                    return "image/bmp";
            }

            return null;
        }

        public static bool TryParseMimeType(string mimeType, out PicFormat result)
        {
            if (mimeType == "image/jpeg")
            {
                result = PicFormat.Jpeg;
                return true;
            }
            else if (mimeType == "image/png")
            {
                result = PicFormat.Png;
                return true;
            }
            else if (mimeType == "image/bmp")
            {
                result = PicFormat.Bmp;
                return true;
            }

            result = PicFormat.Jpeg;
            return false;
        }

        /// <summary>
        /// Resizes avatar if needed and crops it to be square-shaped.
        /// </summary>
        /// <param name="sourcePicFormat"></param>
        /// <param name="sourceImageData"></param>
        /// <returns></returns>
        public static async Task<byte[]> PrepareAvatar(PicFormat sourcePicFormat, byte[] sourceImageData)
        {
            return await Task.Run(() =>
            {
                bool wasResized = false;
                bool wasCropped = false;

                Image img = Image.Load(sourceImageData);

                // Crop if not square
                if (img.Width != img.Height)
                {
                    wasCropped = true;

                    if (img.Width > img.Height)
                    {
                        img.Mutate(ctx => ctx.Crop(new Rectangle((img.Width - img.Height) / 2, 0, img.Height, img.Height)));
                    }
                    else
                    {
                        img.Mutate(ctx => ctx.Crop(new Rectangle(0, (img.Height - img.Width) / 2, img.Width, img.Width)));
                    }
                }

                // Resize if too large
                if (img.Width > AVATAR_MAX_SIZE)
                {
                    wasResized = true;

                    ResizeOptions rszo = new ResizeOptions();
                    rszo.Mode = ResizeMode.Max;
                    rszo.Size = new Size(AVATAR_MAX_SIZE, AVATAR_MAX_SIZE);
                    img.Mutate(ctx => ctx.Resize(rszo));
                }

                if (wasResized || wasCropped)
                {
                    MemoryStream ms = new MemoryStream();
                    switch (sourcePicFormat)
                    {
                        case PicFormat.Jpeg:
                            img.SaveAsJpeg(ms);
                            break;

                        case PicFormat.Png:
                            img.SaveAsPng(ms);
                            break;

                        case PicFormat.Bmp:
                            img.SaveAsBmp(ms);
                            break;

                        default:
                            throw new ArgumentException("Unsupported picture format");
                    }

                    img.Dispose();
                    return ms.ToArray();
                }
                else
                {
                    img.Dispose();
                    return sourceImageData;
                }
            });
        }

        public static async Task<GalleryProcessResult> PrepareGalleryPicture(PicFormat sourcePicFormat, byte[] sourceImageData)
        {
            throw new NotImplementedException();
        }
    }
}

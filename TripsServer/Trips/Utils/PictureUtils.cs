using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities.Pics;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.Processing;
using SixLabors.Primitives;

namespace Trips.Utils
{
    public static class PictureUtils
    {
        public enum GalleryStatus
        {
            Ok, SmallPicture, BadProportion
        }

        public class GalleryProcessResult
        {
            public GalleryProcessResult(GalleryStatus status,
                byte[] smallSizeData, byte[] mediumSizeData, byte[] largeSizeData,
                DateTime? dateTaken, int height, int width)
            {
                Status = status;
                SmallSizeData = smallSizeData;
                MediumSizeData = mediumSizeData;
                LargeSizeData = largeSizeData;
                DateTaken = dateTaken;
                Height = height;
                Width = width;
            }

            public GalleryStatus Status { get; }
            public byte[] SmallSizeData { get; }
            public byte[] MediumSizeData { get; }
            public byte[] LargeSizeData { get; }
            public DateTime? DateTaken { get; }
            public int Height { get; }
            public int Width { get; }
        }


        /// <summary>
        /// Max acceptable file size for images
        /// </summary>
        public const long MAX_FILESIZE = 16 * 1024 * 1024;

        public const int AVATAR_MAX_SIZE = 400;

        public const int GALLERY_SMALLSIZE = 200;
        public const int GALLERY_MEDIUMSIZE = 1200;
        public const int GALLERY_MINDIMENSION = 200;
        public const double GALLERY_MAXPROPORTION = 8.0;

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
                    byte[] result = GetImageBytes(img, sourcePicFormat);
                    img.Dispose();
                    return result;
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
            return await Task.Run(() =>
            {
                Image img = Image.Load(sourceImageData);

                // Verify
                if ((img.Height < GALLERY_MINDIMENSION) || (img.Width < GALLERY_MINDIMENSION))
                {
                    return new GalleryProcessResult(GalleryStatus.SmallPicture, null, null, null, null, img.Height, img.Width);
                }

                double proportion = (double)img.Width / img.Height;
                if ((proportion > GALLERY_MAXPROPORTION) || (proportion < 1.0 / GALLERY_MAXPROPORTION))
                {
                    return new GalleryProcessResult(GalleryStatus.BadProportion, null, null, null, null, img.Height, img.Width);
                }

                // Metadata
                DateTime? dateTaken = GetDateTaken(img);
                // We will resize, so remember the size now
                int width = img.Width;
                int height = img.Height;

                // Prepare different sizes
                byte[] smallSizeData = null;
                byte[] mediumSizeData = null;

                if ((img.Width > GALLERY_MEDIUMSIZE) || (img.Height > GALLERY_MEDIUMSIZE))
                {
                    ResizeOptions rszo = new ResizeOptions();
                    rszo.Mode = ResizeMode.Max;
                    rszo.Size = new Size(GALLERY_MEDIUMSIZE, GALLERY_MEDIUMSIZE);
                    img.Mutate(ctx => ctx.Resize(rszo));

                    mediumSizeData = GetImageBytes(img, sourcePicFormat);
                }
                else
                {
                    mediumSizeData = sourceImageData;
                }

                // Small size after medium, because we are working with single object
                if ((img.Width > GALLERY_SMALLSIZE) || (img.Height > GALLERY_SMALLSIZE))
                {
                    ResizeOptions rszo = new ResizeOptions();
                    rszo.Mode = ResizeMode.Max;
                    rszo.Size = new Size(GALLERY_SMALLSIZE, GALLERY_SMALLSIZE);
                    img.Mutate(ctx => ctx.Resize(rszo));

                    smallSizeData = GetImageBytes(img, sourcePicFormat);
                }
                else
                {
                    // Given the current constraints, this case should never happen (almost)
                    smallSizeData = mediumSizeData; // sic!
                    // According to limitations, in this case mediumSizeData == sourceImageData,
                    // but for consistency mediumSizeData is better.
                }

                return new GalleryProcessResult(GalleryStatus.Ok,
                    smallSizeData, mediumSizeData, sourceImageData,
                    dateTaken, height, width);
            });
        }

        /// <summary>
        /// Saves the picture to byte array (as save to file, but to array)
        /// </summary>
        private static byte[] GetImageBytes(Image img, PicFormat format)
        {
            MemoryStream ms = new MemoryStream();
            switch (format)
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

            return ms.ToArray();
        }

        private static DateTime? GetDateTaken(Image img)
        {
            if (img?.Metadata?.ExifProfile?.Values != null)
            {
                DateTime? dateTimeOriginal = null;
                DateTime? dateTimeDigitized = null;
                foreach (var entry in img.Metadata.ExifProfile.Values)
                {
                    if (entry.Tag == ExifTag.DateTimeOriginal)
                    {
                        dateTimeOriginal = ParseExifDate(entry.Value as string);
                    }
                    else if (entry.Tag == ExifTag.DateTimeDigitized)
                    {
                        dateTimeDigitized = ParseExifDate(entry.Value as string);
                    }
                }

                if (dateTimeOriginal.HasValue)
                {
                    return dateTimeOriginal;
                }
                else
                {
                    return dateTimeDigitized;
                }
            }

            return null;
        }

        private static DateTime? ParseExifDate(string dateStr)
        {
            if (dateStr != null)
            {
                // "yyyy:MM:dd HH:mm:ss"

                string[] split = dateStr.Split(new char[] { ' ', ':' }, StringSplitOptions.RemoveEmptyEntries);
                if (split.Length != 6)
                {
                    return null;
                }

                if (int.TryParse(split[0], out int year)
                    && int.TryParse(split[1], out int month)
                    && int.TryParse(split[2], out int day)
                    && int.TryParse(split[3], out int hour)
                    && int.TryParse(split[4], out int minute)
                    && int.TryParse(split[5], out int second))
                {
                    try
                    {
                        return new DateTime(year, month, day, hour, minute, second);
                    }
                    catch (ArgumentOutOfRangeException)
                    {
                        return null;
                    }
                }
            }

            return null;
        }
    }
}

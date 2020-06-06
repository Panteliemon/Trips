using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Dtos;
using Trips.Entities;
using Trips.Entities.Pics;
using Microsoft.EntityFrameworkCore;

namespace Trips.Utils
{
    /// <summary>
    /// Most common operations with entities
    /// </summary>
    public static class EntityUtils
    {
        /// <summary>
        /// Sets picture indexes and descriptions according to values from dto.
        /// Matches entities by small size id, of course. Parameters can be null.
        /// </summary>
        /// <param name="galleryFromDb">Pictures should be loaded from DB</param>
        /// <param name="galleryDto"></param>
        public static void ApplyChangesToGallery(Gallery galleryFromDb, GalleryDto galleryDto)
        {
            if ((galleryFromDb != null) && (galleryDto != null)
                && (galleryFromDb.Pictures != null) && (galleryDto.Pictures != null))
            {
                for (int i = 0; i < galleryDto.Pictures.Count; i++)
                {
                    Guid currentPictureSmallSizeId = galleryDto.Pictures[i].SmallSizeId;
                    Picture correspondingEntity = galleryFromDb.Pictures.FirstOrDefault(
                        p => p.SmallSizeId == currentPictureSmallSizeId
                    );

                    if (correspondingEntity != null)
                    {
                        correspondingEntity.Description = galleryDto.Pictures[i].Description;
                        correspondingEntity.Index = i + 1;
                    }
                }
            }
        }

        /// <summary>
        /// Deletes data of pictures, belonging to <paramref name="pictureEntry"/>, from storage.
        /// </summary>
        /// <param name="pictureEntry"></param>
        /// <param name="storage"></param>
        /// <returns></returns>
        public static async Task DeletePictureData(Picture pictureEntry, IPictureStorage storage)
        {
            if (pictureEntry != null)
            {
                List<Guid> pictureIds = new List<Guid>();
                CollectPictureIds(pictureEntry, pictureIds);
                await storage.DeletePictures(pictureIds);
            }
        }

        /// <summary>
        /// Deletes data of pictures, belonging to <paramref name="user"/>, from storage.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="storage"></param>
        /// <returns></returns>
        public static async Task DeleteUserPictureData(User user, IPictureStorage storage)
        {
            if (user != null)
            {
                List<Guid> pictureIds = new List<Guid>();
                if (user.ProfilePicture != null)
                {
                    pictureIds.Add(user.ProfilePicture.Value);
                }

                if ((user.SmallSizeProfilePicture != null)
                    && (user.SmallSizeProfilePicture != user.ProfilePicture))
                {
                    pictureIds.Add(user.SmallSizeProfilePicture.Value);
                }

                await storage.DeletePictures(pictureIds);
            }
        }

        /// <summary>
        /// Deletes data of all pictures, belonging to <paramref name="gallery"/>, from storage.
        /// Doesn't remove pictures entities from the gallery entity.
        /// </summary>
        /// <param name="gallery"></param>
        /// <param name="storage"></param>
        /// <returns></returns>
        public static async Task DeleteAllPicturesData(Gallery gallery, IPictureStorage storage)
        {
            if ((gallery != null) && (gallery.Pictures != null))
            {
                List<Guid> pictureIds = new List<Guid>();
                foreach (var picture in gallery.Pictures)
                {
                    CollectPictureIds(picture, pictureIds);
                }

                await storage.DeletePictures(pictureIds);
            }
        }

        /// <summary>
        /// Capture distinct ids to the list.
        /// </summary>
        private static void CollectPictureIds(Picture pictureEntry, List<Guid> receiver)
        {
            if (pictureEntry != null)
            {
                receiver.Add(pictureEntry.SmallSizeId);

                if (pictureEntry.MediumSizeId != pictureEntry.SmallSizeId)
                {
                    receiver.Add(pictureEntry.MediumSizeId);
                }

                if ((pictureEntry.LargeSizeId != pictureEntry.SmallSizeId)
                    && (pictureEntry.LargeSizeId != pictureEntry.MediumSizeId))
                {
                    receiver.Add(pictureEntry.LargeSizeId);
                }
            }
        }
    }
}

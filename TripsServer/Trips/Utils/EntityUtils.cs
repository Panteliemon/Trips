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
        /// Refreshes picture indexes in the entity according to desired order from DTO.
        /// Matches by small size id, of course. Parameters can be null.
        /// </summary>
        /// <param name="galleryFromDb">Mind that pictures should be loaded from db
        /// for correct work.</param>
        /// <param name="desiredOrder"></param>
        public static void ReorderPicturesInTheGallery(Gallery galleryFromDb, GalleryDto desiredOrder)
        {
            if ((galleryFromDb != null) && (galleryFromDb.Pictures != null)
                && (desiredOrder != null) && (desiredOrder.Pictures != null))
            {
                for (int i = 0; i < desiredOrder.Pictures.Count; i++)
                {
                    Guid currentPictureSmallSizeId = desiredOrder.Pictures[i].SmallSizeId;
                    Picture correspondingEntity = galleryFromDb.Pictures.FirstOrDefault(
                        p => p.SmallSizeId == currentPictureSmallSizeId
                    );

                    if (correspondingEntity != null)
                    {
                        correspondingEntity.Index = i + 1;
                    }
                }
            }
        }

        /// <summary>
        /// Deletes records from <paramref name="picsContext"/>, which correspond to
        /// <paramref name="pictureEntry"/> entity. Does NOT save changes in the picsContext.
        /// </summary>
        /// <param name="pictureEntry"></param>
        /// <param name="picsContext"></param>
        public static void DeletePictureData(Picture pictureEntry, PicsContext picsContext)
        {
            if (pictureEntry != null)
            {
                PicData smallSizeData = new PicData() { Id = pictureEntry.SmallSizeId };
                picsContext.Entry(smallSizeData).State = EntityState.Deleted;

                if (pictureEntry.MediumSizeId != pictureEntry.SmallSizeId)
                {
                    PicData mediumSizeData = new PicData() { Id = pictureEntry.MediumSizeId };
                    picsContext.Entry(mediumSizeData).State = EntityState.Deleted;
                }

                if ((pictureEntry.LargeSizeId != pictureEntry.SmallSizeId)
                    && (pictureEntry.LargeSizeId != pictureEntry.MediumSizeId))
                {
                    PicData largeSizeData = new PicData() { Id = pictureEntry.LargeSizeId };
                    picsContext.Entry(largeSizeData).State = EntityState.Deleted;
                }
            }
        }

        /// <summary>
        /// Deletes records from <paramref name="picsContext"/> for each picture entry from
        /// <paramref name="gallery"/>. Does NOT save changes in the picsContext.
        /// </summary>
        /// <param name="gallery"></param>
        /// <param name="picsContext"></param>
        public static void DeleteAllPicturesData(Gallery gallery, PicsContext picsContext)
        {
            if ((gallery != null) && (gallery.Pictures != null))
            {
                foreach (var picture in gallery.Pictures)
                {
                    DeletePictureData(picture, picsContext);
                }
            }
        }
    }
}

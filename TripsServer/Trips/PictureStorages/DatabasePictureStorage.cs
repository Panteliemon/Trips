using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Trips.Entities.Pics;

namespace Trips.PictureStorages
{
    /* REMOVED
    /// <summary>
    /// Storage that stored pictures in a database with dbcontext PicsContext.
    /// </summary>
    [Obsolete("DB pictures storage is no more in use!")]
    public class DatabasePictureStorage : IPictureStorage
    {
        public async Task UploadPictures(params PictureData[] picturesData)
        {
            if ((picturesData == null) || (picturesData.Length == 0))
            {
                return;
            }

            PicsContext picsContext = new PicsContext();
            foreach (PictureData pic in picturesData)
            {
                PicData entry = new PicData();
                entry.Id = pic.Id;
                entry.Format = pic.Format;
                entry.Data = pic.Data;
                await picsContext.AddAsync(entry);
            }

            await picsContext.SaveChangesAsync();
        }

        public async Task DeletePictures(ICollection<Guid> pictureIds)
        {
            if ((pictureIds == null) || (pictureIds.Count == 0))
            {
                return;
            }

            PicsContext picsContext = new PicsContext();
            foreach (Guid id in pictureIds)
            {
                PicData entry = new PicData() { Id = id };
                picsContext.Entry(entry).State = EntityState.Deleted;
            }

            await picsContext.SaveChangesAsync();
        }
    } */
}

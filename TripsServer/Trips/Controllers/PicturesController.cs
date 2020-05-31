using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Trips.Entities.Pics;
using Trips.PictureStorages;
using Trips.Utils;

namespace Trips.Controllers
{
    [ApiController]
    public class PicturesController : ControllerBase
    {
        private PicsContext _dbContext;

        public PicturesController(PicsContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        [Route("pics/{fileName}")]
        public async Task<IActionResult> GetPicture(string fileName)
        {
            // Return from file system, if the app runs locally, and return from DB if we are on server.
            // Pictures from DB functionality is now obsolete, must not be used, and support
            // will be one day removed.

            if (string.IsNullOrEmpty(fileName))
            {
                return NotFound();
            }

            SplitToIdAndExtension(fileName, out string id, out string extension);

            if (Program.PictureStorage is LocalFSPictureStorage localFsStorage)
            {
                byte[] data = await System.IO.File.ReadAllBytesAsync(Path.Combine(localFsStorage.RootFolder, fileName));
                return new FileStreamResult(new MemoryStream(data), PictureUtils.GetMimeTypeFor(extension));
            }
            else // Database (obsolete)
            {
                // Not use Storage for read (it cannot read anyway), but use DB directly
                if (Guid.TryParse(id, out Guid pictureId))
                {
                    PicData pic = await Task.Run(() => _dbContext.PicData.FirstOrDefault(p => p.Id == pictureId));
                    if (pic != null)
                    {
                        return new FileStreamResult(new MemoryStream(pic.Data), PictureUtils.GetMimeTypeFor(pic.Format));
                    }
                    else
                    {
                        NotFound();
                    }
                }
            }

            return NotFound();
        }

        /// <summary>
        /// Splits file name to name and extension with leading period
        /// </summary>
        private void SplitToIdAndExtension(string fileName, out string id, out string extension)
        {
            int periodIndex = fileName.LastIndexOf('.');
            if (fileName.LastIndexOf('.') >= 0)
            {
                id = fileName.Substring(0, periodIndex);
                extension = fileName.Substring(periodIndex);
            }
            else
            {
                id = fileName.Substring(0, periodIndex);
                extension = fileName.Substring(periodIndex);
            }
        }
    }
}
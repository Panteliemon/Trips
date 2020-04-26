using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Trips.Entities.Pics;
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
        [Route("pics/{id}")]
        public async Task<IActionResult> GetPicture(string id)
        {
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

            return NotFound();
        }
    }
}
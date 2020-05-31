using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips
{
    /// <summary>
    /// Generalized picture storage.
    /// The instance is reusable: can have 1 instance during the whole app lifetime.
    /// </summary>
    public interface IPictureStorage
    {
        Task UploadPictures(params PictureData[] picturesData);
        Task DeletePictures(ICollection<Guid> pictureIds);
    }
}

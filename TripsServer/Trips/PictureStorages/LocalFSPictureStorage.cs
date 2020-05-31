using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Trips.Utils;

namespace Trips.PictureStorages
{
    /// <summary>
    /// Storage that stores uploaded pictures in some local machine's folder
    /// </summary>
    public class LocalFSPictureStorage : IPictureStorage
    {
        public LocalFSPictureStorage(string rootFolder)
        {
            if (!Directory.Exists(rootFolder))
            {
                throw new ArgumentException($"Folder {rootFolder} does not exist");
            }

            RootFolder = rootFolder;
        }

        public string RootFolder { get; }

        public async Task UploadPictures(params PictureData[] picturesData)
        {
            foreach (PictureData pic in picturesData)
            {
                string fileName = Path.Combine(RootFolder,
                    pic.Id.ToString().ToLower() + PictureUtils.GetFileExtensionFor(pic.Format));
                await File.WriteAllBytesAsync(fileName, pic.Data);
            }
        }

        public Task DeletePictures(ICollection<Guid> pictureIds)
        {
            Task result = Task.Run(() =>
            {
                foreach (Guid id in pictureIds)
                {
                    var foundFiles = Directory.GetFiles(RootFolder, id.ToString() + '*');
                    foreach (string fileName in foundFiles)
                    {
                        File.Delete(fileName);
                    }
                }
            });

            return result;
        }
    }
}

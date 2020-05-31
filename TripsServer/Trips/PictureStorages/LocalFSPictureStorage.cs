using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Trips.Utils;

namespace Trips.PictureStorages
{
    public class LocalFSPictureStorage : IPictureStorage
    {
        private string _root;

        public LocalFSPictureStorage(string rootFolder)
        {
            if (!Directory.Exists(rootFolder))
            {
                throw new ArgumentException($"Folder {rootFolder} does not exist");
            }

            _root = rootFolder;
        }

        public async Task UploadPictures(params PictureData[] picturesData)
        {
            foreach (PictureData pic in picturesData)
            {
                string fileName = Path.Combine(_root,
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
                    var foundFiles = Directory.GetFiles(_root, id.ToString() + '*');
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

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Trips.Config;
using Trips.Utils;

namespace Trips.PictureStorages
{
    /// <summary>
    /// Storage that stores pictures in Amazon's bucket
    /// </summary>
    public class AmazonS3PictureStorage : IPictureStorage
    {
        // That's not configurable, because bucket name goes with region,
        // and I don't know how to make region configurable.
        private const string BUCKET_NAME = "poezdo4ki-pics";
        private static readonly RegionEndpoint _bucketRegion = RegionEndpoint.EUCentral1;

        private IAmazonS3 _s3Client;

        public AmazonS3PictureStorage(Keys keys)
        {
            AWSCredentials credentials = new BasicAWSCredentials(keys.AmazonAccessKey, keys.AmazonSecretKey);
            _s3Client = new AmazonS3Client(credentials, _bucketRegion);
        }

        public async Task UploadPictures(params PictureData[] picturesData)
        {
            if ((picturesData != null) && (picturesData.Length > 0))
            {
                foreach (PictureData picData in picturesData)
                {
                    string uploadedName = picData.Id.ToString().ToLower() + PictureUtils.GetFileExtensionFor(picData.Format);

                    using (MemoryStream ms = new MemoryStream(picData.Data))
                    {
                        var uploadRequest = new TransferUtilityUploadRequest();
                        uploadRequest.AutoCloseStream = false;
                        uploadRequest.BucketName = BUCKET_NAME;
                        uploadRequest.CannedACL = S3CannedACL.PublicRead;
                        uploadRequest.InputStream = ms;
                        uploadRequest.PartSize = 2 * 1024 * 1024;
                        uploadRequest.Key = uploadedName;

                        var transferUtility = new TransferUtility(_s3Client);
                        await transferUtility.UploadAsync(uploadRequest);
                    }
                }
            }
        }

        public async Task DeletePictures(ICollection<Guid> pictureIds)
        {
            if ((pictureIds != null) && (pictureIds.Count > 0))
            {
                foreach (Guid pictureId in pictureIds)
                {
                    // Cannot know exact filename by having ID only,
                    // but there can be only one file with that ID anyway, so request its name first.
                    var req = new ListObjectsV2Request();
                    req.BucketName = BUCKET_NAME;
                    req.Prefix = pictureId.ToString().ToLower();
                    req.MaxKeys = 1;                   
                    var existing = await _s3Client.ListObjectsV2Async(req);
                    
                    if (existing.S3Objects.Count > 0)
                    {
                        var deleteRequest = new DeleteObjectRequest();
                        deleteRequest.BucketName = BUCKET_NAME;
                        deleteRequest.Key = existing.S3Objects[0].Key;
                        await _s3Client.DeleteObjectAsync(deleteRequest);
                    }
                }
            }
        } 
    }
}

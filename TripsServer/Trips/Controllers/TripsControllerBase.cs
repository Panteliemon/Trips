using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Trips.Dtos;
using Trips.Entities;
using Trips.Utils;

namespace Trips.Controllers
{
    // Well, the name here doesn't refer to the Trip entity, but rather to the whole Trips project. Awkward.
    public abstract class TripsControllerBase : ControllerBase
    {
        public TripsControllerBase(TripsContext dbContext, IMapper mapper)
        {
            DbContext = dbContext;
            Mapper = mapper;
        }

        protected TripsContext DbContext { get; private set; }

        protected IMapper Mapper { get; private set; }

        /// <summary>
        /// Gets current user from claimed identity from JWT.
        /// If there is no, or something wrong, then returns null.
        /// </summary>
        /// <returns></returns>
        protected User GetCurrentUser()
        {
            Claim uidClaim = ControllerContext.HttpContext.User?.Claims.FirstOrDefault(c => c.Type == Encryption.USER_ID_CLAIM);
            if (uidClaim != null)
            {
                if (int.TryParse(uidClaim.Value, out int userId))
                {
                    return DbContext.Users.FirstOrDefault(u => u.Id == userId);
                }
            }

            return null;
        }

        /// <summary>
        /// Async version. Gets current user from claimed identity from JWT.
        /// If there is no, or something wrong, then returns null.
        /// </summary>
        /// <returns></returns>
        protected async Task<User> GetCurrentUserAsync()
        {
            Claim uidClaim = ControllerContext.HttpContext.User?.Claims.FirstOrDefault(c => c.Type == Encryption.USER_ID_CLAIM);
            if (uidClaim != null)
            {
                if (int.TryParse(uidClaim.Value, out int userId))
                {
                    return await DbContext.Users.Where(u => u.Id == userId).FirstOrDefaultAsync();
                }
            }

            return null;
        }

        /// <summary>
        /// Deals with uploading gallery picture and saving it to the picture storage and to the TripsDB.
        /// Works with controller's current <see cref="DbContext"/>. Saves changes after all is done.
        /// If returns ok, result body contains dto of inserted picture.
        /// </summary>
        /// <param name="galleryId">Id of gallery entity, to which add the picture. This parameter is not checked,
        /// so whether the gallery exists should be checked outside.</param>
        /// <param name="lastPictureIndex">The greatest index (value of field Index) of picture from gallery
        /// with id <paramref name="galleryId"/>. Nothing is checked again, this method trusts what you have passed.
        /// Null in case if gallery contains no pictures.</param>
        /// <param name="uploadedBy">User to which assign picture's UploadedBy field.
        /// Should belong to current controller's <see cref="DbContext"/></param>
        /// <param name="setChangedDateFunc">Action for setting parent entity's changed date, if it's needed.
        /// Is invoked with await on the same thread the method is invoked.
        /// This action is supposed to only set properties, and not save the changes.</param>
        /// <returns></returns>
        protected async Task<IActionResult> UploadPictureHandler(int galleryId, int? lastPictureIndex, User uploadedBy, Func<DateTime, Task> setChangedDateFunc)
        {
            try
            {
                if (Request.Form.Files.Count == 0)
                {
                    return BadRequest("NO_FILE");
                }

                IFormFile file = Request.Form.Files[0];
                if (file.Length > 0)
                {
                    if (file.Length > PictureUtils.MAX_FILESIZE)
                    {
                        return BadRequest("FILE_TOO_LARGE");
                    }

                    if (!PictureUtils.TryParseMimeType(file.ContentType, out PicFormat format))
                    {
                        return BadRequest($"FILE_NOT_SUPPORTED");
                    }

                    // Upload
                    byte[] buffer = new byte[file.Length];
                    using (var stream = file.OpenReadStream())
                    {
                        await stream.ReadAsync(buffer, 0, buffer.Length);
                    }

                    // Process picture
                    var pictureData = await PictureUtils.PrepareGalleryPicture(format, buffer);

                    switch (pictureData.Status)
                    {
                        case PictureUtils.GalleryStatus.SmallPicture:
                            return BadRequest("SMALL_PICTURE");
                        case PictureUtils.GalleryStatus.BadProportion:
                            return BadRequest("CROOKED_PICTURE");
                    }

                    // Insert data into the storage
                    List<PictureData> picturesToInsert = new List<PictureData>();
                    PictureData largeSize = new PictureData(Guid.NewGuid(), format, pictureData.LargeSizeData);
                    picturesToInsert.Add(largeSize);

                    PictureData mediumSize = largeSize;
                    if (pictureData.MediumSizeData != pictureData.LargeSizeData)
                    {
                        mediumSize = new PictureData(Guid.NewGuid(), format, pictureData.MediumSizeData);
                        picturesToInsert.Add(mediumSize);
                    }

                    PictureData smallSize = mediumSize;
                    if (pictureData.SmallSizeData != pictureData.MediumSizeData)
                    {
                        smallSize = new PictureData(Guid.NewGuid(), format, pictureData.SmallSizeData);
                        picturesToInsert.Add(smallSize);
                    }

                    await Program.PictureStorage.UploadPictures(picturesToInsert.ToArray());

                    // Insert picture data into Trips DB
                    DateTime nowDate = DateTime.Now;
                    Picture pictureEntry = new Picture();
                    pictureEntry.GalleryId = galleryId;
                    pictureEntry.Index = lastPictureIndex.HasValue
                        ? lastPictureIndex.Value + 1 : 1; // Indexes in gallery start from 1.
                    pictureEntry.Format = format;
                    pictureEntry.SmallSizeId = smallSize.Id;
                    pictureEntry.MediumSizeId = mediumSize.Id;
                    pictureEntry.LargeSizeId = largeSize.Id;
                    pictureEntry.DateTaken = pictureData.DateTaken;
                    pictureEntry.DateUploaded = nowDate;
                    pictureEntry.UploadedBy = uploadedBy;
                    pictureEntry.Height = pictureData.Height;
                    pictureEntry.Width = pictureData.Width;

                    await DbContext.Pictures.AddAsync(pictureEntry);

                    // Save some changes to gallery's parent entity, if needed
                    if (setChangedDateFunc != null)
                    {
                        await setChangedDateFunc(nowDate);
                    }

                    await DbContext.SaveChangesAsync();

                    // OK so return DTO for what has been inserted
                    PictureDto picDto = Mapper.Map<PictureDto>(pictureEntry);
                    return Ok(picDto);
                }
                else
                {
                    return BadRequest("FILE_EMPTY");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

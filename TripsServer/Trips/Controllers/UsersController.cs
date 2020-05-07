using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Trips.Entities;
using Trips.Entities.Pics;
using Trips.Dtos;
using Trips.Utils;
using AutoMapper;

namespace Trips.Controllers
{
    [ApiController]
    [Authorize]
    public class UsersController : TripsControllerBase
    {
        public UsersController(TripsContext dbContext, IMapper mapper)
            : base(dbContext, mapper)
        {
        }

        [HttpGet]
        [Route("user/{id}")]
        public async Task<UserHeaderDto> GetUserHeader(int id)
        {
            User user = await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Id == id));
            return Mapper.Map<UserHeaderDto>(user);
        }

        [HttpGet]
        [Route("user/{id}/full")]
        public async Task<UserDto> GetUser(int id)
        {
            User user = await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Id == id));
            return Mapper.Map<UserDto>(user);
        }

        [HttpGet]
        [Route("user/name={name}")]
        public async Task<UserHeaderDto> GetUserByName(string name)
        {
            string lowerName = name.ToLower();
            User user = await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Name.ToLower() == lowerName));
            return Mapper.Map<UserHeaderDto>(user);
        }

        [HttpGet]
        [Route("users")]
        public async Task<IList<UserHeaderDto>> GetUsers()
        {
            var result = await Task.Run(() => DbContext.Users.Select(u => Mapper.Map<UserHeaderDto>(u)).ToList());
            return result;
        }

        [HttpPost]
        [Route("user/new")]
        public async Task<IActionResult> AddUser([FromForm] string userName, [FromForm] string userPassword)
        {
            // Check user rights
            User currentUser = await GetCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            if (!currentUser.IsAdmin)
            {
                return Forbid();
            }

            if (!IsValidUserName(userName))
            {
                return BadRequest("BAD_NAME");
            }

            if (!IsValidPassword(userPassword))
            {
                return BadRequest("WEAK_PASSWORD");
            }

            bool userExists = await Task.Run(() => DbContext.Users.Where(u => u.Name.ToLower() == userName.ToLower()).Count() > 0);
            if (userExists)
            {
                return Conflict("ALREADY_EXISTS");
            }
            else
            {
                User u = new User();
                u.Name = userName;
                u.HashedPassword = Encryption.GetHashedPassword(userPassword);
                u.RegisteredDate = DateTime.Now;
                DbContext.Add(u);
                await DbContext.SaveChangesAsync();

                return Ok();
            }
        }

        [HttpPut]
        [Route("user/update")]
        public async Task<IActionResult> UpdateUser(UserDto userDto)
        {
            User currentUser = await GetCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            User user = await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Id == userDto.Id));
            if (user == null)
            {
                return NotFound();
            }
            else
            {
                // Allow if update self or if is admin
                if ((user.Id != currentUser.Id) && (!currentUser.IsAdmin))
                {
                    return Forbid();
                }

                string lowerCaseName = userDto.Name.ToLower();
                User existingNameUser = await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Name.ToLower() == lowerCaseName));
                if ((existingNameUser != null) && (existingNameUser.Id != userDto.Id))
                {
                    return Conflict("ALREADY_EXISTS");
                }

                if (!IsValidUserName(userDto.Name))
                {
                    return BadRequest("BAD_NAME");
                }

                // Update fields
                if (user.Name != userDto.Name)
                {
                    // Restrict renaming
                    if (user.LastChangedName.HasValue)
                    {
                        if ((DateTime.Now <= user.LastChangedName.Value.Add(Program.USERNAME_CHANGE_INTERVAL))
                            // Admin can bypass this restriction
                            && (!currentUser.IsAdmin))
                        {
                            return BadRequest("RENAME_FORBIDDEN");
                        }
                    }

                    user.Name = userDto.Name;
                    user.LastChangedName = DateTime.Now;
                }

                // Registered date, Password, Profile picture are not to be updated by this request.

                // Priviliges: are only be changed by admin
                if ((userDto.IsAdmin != user.IsAdmin)
                    || (userDto.CanEditGeography != user.CanEditGeography)
                    || (userDto.CanPublishNews != user.CanPublishNews)
                    || (userDto.CanPublishTrips != user.CanPublishTrips))
                {
                    if (!currentUser.IsAdmin)
                    {
                        return Forbid();
                    }
                    else if ((!userDto.IsAdmin) && (currentUser.Id == user.Id))
                    {
                        return BadRequest("RESETADMIN_SELF");
                    }

                    user.IsAdmin = userDto.IsAdmin;
                    user.CanEditGeography = userDto.CanEditGeography;
                    user.CanPublishNews = userDto.CanPublishNews;
                    user.CanPublishTrips = userDto.CanPublishTrips;
                }

                await DbContext.SaveChangesAsync();

                // Conversion operation: happens only for users that set their profile picture
                // before small size profile pictures were introduced. Not happens for new users.
                if (user.ProfilePicture.HasValue && (!user.SmallSizeProfilePicture.HasValue))
                {
                    await CreateSmallSizeProfilePicture(user);
                }

                return Ok();
            }
        }

        // For users to change their own password
        [HttpPost]
        [Route("user/{id}/changepassword")]
        public async Task<IActionResult> ChangeUserPassword(int id, [FromForm] string oldPassword, [FromForm] string newPassword)
        {
            User currentUser = await GetCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            User user = await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Id == id));
            if (user == null)
            {
                return NotFound();
            }
            else
            {
                // Can only change password to himself
                if (currentUser.Id != user.Id)
                {
                    return Forbid();
                }

                if (user.HashedPassword != Encryption.GetHashedPassword(oldPassword))
                {
                    return BadRequest("WRONG_PASSWORD");
                }

                if (!IsValidPassword(newPassword))
                {
                    return BadRequest("WEAK_PASSWORD");
                }

                user.HashedPassword = Encryption.GetHashedPassword(newPassword);
                await DbContext.SaveChangesAsync();
                return Ok();
            }
        }

        // For admins to reset
        [HttpPost]
        [Route("user/{id}/resetpassword")]
        public async Task<IActionResult> ResetUserPassword(int id, [FromForm] string newPassword)
        {
            User currentUser = await GetCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            if (!currentUser.IsAdmin)
            {
                return Forbid();
            }

            User user = await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Id == id));
            if (user == null)
            {
                return NotFound();
            }
            else
            {
                if (!IsValidPassword(newPassword))
                {
                    return BadRequest("WEAK_PASSWORD");
                }

                user.HashedPassword = Encryption.GetHashedPassword(newPassword);
                await DbContext.SaveChangesAsync();
                return Ok();
            }
        }

        [HttpPost]
        [Route("user/{id}/uploadprofilepic")]
        public async Task<IActionResult> ChangeProfilePicture(int id)
        {
            User currentUser = await GetCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            User user = await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Id == id));
            if (user == null)
            {
                return NotFound();
            }
            else
            {
                // Allow if changes to himself, or if is admin
                if ((currentUser.Id != user.Id) && (!currentUser.IsAdmin))
                {
                    return Forbid();
                }

                try
                {
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

                        // Allowed to upload
                        byte[] buffer = new byte[file.Length];
                        using (var stream = file.OpenReadStream())
                        {
                            await stream.ReadAsync(buffer, 0, buffer.Length);
                        }

                        // Upload successfull.
                        // Resize/crop the image.
                        var pictureResult = await PictureUtils.PrepareProfilePicture(format, buffer);

                        // Time to change
                        await Task.Run(() =>
                        {
                            PicsContext picsContext = new PicsContext();
                            // Erase previous pictures, if there are any
                            EntityUtils.DeleteUserPictureData(user, picsContext);

                            PicData mainPic = new PicData();
                            mainPic.Id = Guid.NewGuid();
                            mainPic.Format = format;
                            mainPic.Data = pictureResult.MainData;
                            picsContext.PicData.Add(mainPic);

                            PicData smallPic = new PicData();
                            smallPic.Id = Guid.NewGuid();
                            smallPic.Format = format;
                            smallPic.Data = pictureResult.SmallSizeData;
                            picsContext.PicData.Add(smallPic);

                            picsContext.SaveChanges();

                            user.ProfilePicture = mainPic.Id;
                            user.SmallSizeProfilePicture = smallPic.Id;
                            DbContext.SaveChanges();
                        });

                        return Ok();
                    }
                    else
                    {
                        return BadRequest("FILE_EMPTY");
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                    // Client cannot understand it actually, so for debug only.
                }
            }
        }

        [HttpPost]
        [Route("user/{id}/resetprofilepic")]
        public async Task<IActionResult> ResetProfilePicture(int id)
        {
            User currentUser = await GetCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            User user = await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Id == id));
            if (user == null)
            {
                return NotFound();
            }
            else
            {
                if (user.ProfilePicture.HasValue || user.SmallSizeProfilePicture.HasValue)
                {
                    // Allow if changes to himself, or if is admin
                    if ((currentUser.Id != user.Id) && (!currentUser.IsAdmin))
                    {
                        return Forbid();
                    }

                    await Task.Run(() =>
                    {
                        PicsContext picsContext = new PicsContext();
                        EntityUtils.DeleteUserPictureData(user, picsContext);
                        picsContext.SaveChanges();
                    });

                    user.ProfilePicture = null;
                    user.SmallSizeProfilePicture = null;
                    await DbContext.SaveChangesAsync();
                }

                return Ok();
            }
        }

        [HttpDelete]
        [Route("user/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            return await Task.Run<IActionResult>(() =>
            {
                User currentUser = GetCurrentUser();
                if (currentUser == null)
                {
                    return Unauthorized();
                }

                if (!currentUser.IsAdmin)
                {
                    return Forbid();
                }

                User user = DbContext.Users.FirstOrDefault(u => u.Id == id);
                if (user != null)
                {
                    // Don't allow self-deletion
                    if (user.Id == currentUser.Id)
                    {
                        return BadRequest("DELETE_SELF");
                    }

                    // Remove profile pic from pictures database
                    if (user.ProfilePicture.HasValue || user.SmallSizeProfilePicture.HasValue)
                    {
                        PicsContext picsContext = new PicsContext();
                        EntityUtils.DeleteUserPictureData(user, picsContext);
                        picsContext.SaveChanges();
                    }

                    DbContext.Remove(user);
                    DbContext.SaveChanges();
                    return Ok();
                }

                return NotFound();
            });
        }

        private static bool IsValidUserName(string userName)
        {
            return !string.IsNullOrWhiteSpace(userName);
        }

        private static bool IsValidPassword(string password)
        {
            return (!string.IsNullOrWhiteSpace(password)) && (password.Length >= 6);
        }

        /// <summary>
        /// Only for users that have ordinary profile picture and don't have min size version.
        /// Perform all necessary checks outside!
        /// </summary>
        private async Task CreateSmallSizeProfilePicture(User user)
        {
            PicsContext picsContext = new PicsContext();
            PicData existingPic = await picsContext.PicData.Where(pd => pd.Id == user.ProfilePicture.Value).FirstOrDefaultAsync();
            if (existingPic != null)
            {
                var processed = await PictureUtils.PrepareProfilePicture(existingPic.Format, existingPic.Data);

                PicData smallSizePic = new PicData();
                smallSizePic.Id = Guid.NewGuid();
                smallSizePic.Format = existingPic.Format;
                smallSizePic.Data = processed.SmallSizeData;
                picsContext.PicData.Add(smallSizePic);

                await picsContext.SaveChangesAsync();

                user.SmallSizeProfilePicture = smallSizePic.Id;
                await DbContext.SaveChangesAsync();
            }
        }
    }
}
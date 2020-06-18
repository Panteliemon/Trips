using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Trips.Dtos;
using Trips.Entities;
using Trips.Utils;

namespace Trips.Controllers
{
    [ApiController]
    [Authorize]
    public class VehiclesController : TripsControllerBase
    {
        public VehiclesController(TripsContext dbContext, IMapper mapper)
            : base(dbContext, mapper)
        {
        }

        #region CRUD

        [HttpGet]
        [Route("vehicles")]
        public async Task<IList<VehicleHeaderDto>> GetVehiclesList(string user)
        {
            var query = DbContext.Vehicles.AsQueryable();

            if (!string.IsNullOrEmpty(user))
            {
                List<int> userIds = StringUtils.ParseIds(user, '|');
                if (userIds.Count > 0)
                {
                    query = query.Where(v => (v.Owner != null) && userIds.Contains(v.Owner.Id));
                }
            }

            List<Vehicle> loadedList = await query.Include(v => v.TitlePicture).ToListAsync();
            List<VehicleHeaderDto> result = loadedList.Select(v => Mapper.Map<VehicleHeaderDto>(v)).ToList();
            return result;
        }

        [HttpGet]
        [Route("vehicle/{id}")]
        public async Task<VehicleDto> GetVehicle(int id)
        {
            Vehicle vehicle = await DbContext.Vehicles.Where(v => v.Id == id)
                .Include(v => v.Owner)
                .Include(v => v.TitlePicture) // without UploadedBy
                .Include(v => v.AddedBy)
                .Include(v => v.ChangedBy)

                .Include(v => v.Gallery)
                .ThenInclude(g => g.Pictures)
                .ThenInclude((Picture p) => p.UploadedBy)

                .FirstOrDefaultAsync();

            // Order pictures in the gallery
            if (vehicle?.Gallery?.Pictures != null)
            {
                vehicle.Gallery.Pictures = vehicle.Gallery.Pictures.OrderBy(p => p.Index).ToList();
            }

            VehicleDto result = Mapper.Map<VehicleDto>(vehicle);
            return result;
        }

        [HttpPost]
        [Route("vehicles")]
        public async Task<VehicleDto> CreateVehicle(int? owner)
        {
            if (Program.IsLocked)
            {
                Response.StatusCode = StatusCodes.Status423Locked;
                return null;
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (
                    // Is allowed to edit vehicle if is admin or if it's his vehicle
                    (!currentUser.IsAdmin) && (owner != currentUser.Id)
               ))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return null;
            }

            User vehicleOwner = null;
            if (owner.HasValue)
            {
                vehicleOwner = await DbContext.Users.Where(u => u.Id == owner).FirstOrDefaultAsync();
                if (vehicleOwner == null)
                {
                    Response.StatusCode = StatusCodes.Status404NotFound;
                    return null;
                }
            }
            
            // Create vehicle
            DateTime nowDate = DateTime.Now;

            Vehicle vehicle = new Vehicle();
            vehicle.Owner = vehicleOwner;
            vehicle.Gallery = new Gallery();
            vehicle.Gallery.Owner = GalleryOwner.Vehicle;
            vehicle.AddedBy = currentUser;
            vehicle.AddedDate = nowDate;

            DbContext.Add(vehicle);
            await DbContext.SaveChangesAsync();

            // Update gallery owner id
            vehicle.Gallery.OwnerId = vehicle.Gallery.Id;
            await DbContext.SaveChangesAsync();

            VehicleDto result = Mapper.Map<VehicleDto>(vehicle);
            return result;
        }

        /// <summary>
        /// As usual, gallery is optional. If omitted, means no changes in the gallery.
        /// </summary>
        [HttpPut]
        [Route("vehicle")]
        public async Task<IActionResult> UpdateVehicle(VehicleDto vehicleDto)
        {
            if (vehicleDto == null)
            {
                return BadRequest("MISSING_PARAMS");
            }

            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Specific editing rules make us to query the entity first,
            // and only then we are able to check permissions.

            Vehicle vehicle = await DbContext.Vehicles.Where(v => v.Id == vehicleDto.Id)
                .Include(v => v.Owner)
                .Include(v => v.TitlePicture)
                .Include(v => v.ChangedBy)

                // Always include the gallery, because it's simpler
                .Include(v => v.Gallery)
                .ThenInclude(g => g.Pictures)

                .FirstOrDefaultAsync();

            if (vehicle == null)
            {
                return NotFound();
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (
                    // Is allowed to edit vehicle if is admin or if it's his vehicle (and remains his after update)
                    (!currentUser.IsAdmin) && ((vehicle.Owner?.Id != currentUser.Id)
                                               || (vehicleDto.Owner?.Id != currentUser.Id))
               ))
            {
                return Forbid();
            }

            //----------- Ready to update

            vehicle.Name = vehicleDto.Name;
            vehicle.OfficialName = vehicleDto.OfficialName;
            vehicle.Description = vehicleDto.Description;
            vehicle.LicenseNumber = vehicleDto.LicenseNumber;
            vehicle.YearOfManufacture = vehicleDto.YearOfManufacture;
            vehicle.AcceptableAccessibility = vehicleDto.AcceptableAccessibility;

            if (vehicleDto.Owner?.Id != vehicle.Owner?.Id)
            {
                if (vehicleDto.Owner == null)
                {
                    vehicle.Owner = null;
                }
                else
                {
                    // Find the entity in DB and bind
                    vehicle.Owner = await DbContext.Users.Where(u => u.Id == vehicleDto.Owner.Id).FirstOrDefaultAsync();
                    // Don't check existance, because I'm lazy
                }
            }

            if (vehicleDto.TitlePicture?.SmallSizeId != vehicle.TitlePicture?.SmallSizeId)
            {
                if (vehicleDto.TitlePicture == null)
                {
                    vehicle.TitlePicture = null;
                }
                else
                {
                    // Find in the gallery
                    Picture correspondingEntity = vehicle.Gallery?.Pictures.FirstOrDefault(pic => pic.SmallSizeId == vehicleDto.TitlePicture.SmallSizeId);
                    if (correspondingEntity != null)
                    {
                        vehicle.TitlePicture = correspondingEntity;
                    }
                }
            }

            // Gallery changes: reordering, descriptions...
            EntityUtils.ApplyChangesToGallery(vehicle.Gallery, vehicleDto.Gallery);

            vehicle.ChangedDate = DateTime.Now;
            vehicle.ChangedBy = currentUser;
            await DbContext.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        [Route("vehicle/{id}")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Specific editing rules make us to query the entity first,
            // and only then we are able to check permissions.

            Vehicle vehicle = await DbContext.Vehicles.Where(v => v.Id == id)
                .Include(v => v.Owner)
                .Include(v => v.Gallery)
                .ThenInclude(g => g.Pictures)
                .FirstOrDefaultAsync();

            if (vehicle == null)
            {
                return NotFound();
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (
                    // Is allowed to delete vehicle if is admin or if it's his vehicle
                    (!currentUser.IsAdmin) && (vehicle.Owner?.Id != currentUser.Id)
               ))
            {
                return Forbid();
            }

            //----------- Do delete

            DbContext.Entry(vehicle).State = EntityState.Deleted;
            DbContext.Entry(vehicle.Gallery).State = EntityState.Deleted;
            // Purge pictures data from pictures storage
            await EntityUtils.DeleteAllPicturesData(vehicle.Gallery, Program.PictureStorage);

            await DbContext.SaveChangesAsync();

            return Ok();
        }

        #endregion

        #region Gallery Management

        [HttpPost]
        [Route("vehicle/{vehicleId}/gallery")]
        public async Task<IActionResult> UploadPicture(int vehicleId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            var vehicleData = await DbContext.Vehicles
                .Where(v => (v.Id == vehicleId) && (v.Gallery != null))
                .Select(v => new
                {
                    GalleryId = v.Gallery.Id,
                    LastPictureIndex = v.Gallery.Pictures.Max(p => (int?)p.Index),
                    OwnerId = (v.Owner != null) ? (int?)v.Owner.Id : null
                }).FirstOrDefaultAsync();

            if (vehicleData == null)
            {
                return NotFound();
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (
                    // Is allowed to edit vehicle if is admin or if it's his vehicle
                    (!currentUser.IsAdmin) && (vehicleData.OwnerId != currentUser.Id)
               ))
            {
                return Forbid();
            }

            return await UploadPictureHandler(vehicleData.GalleryId, vehicleData.LastPictureIndex, currentUser,
                async changedDate =>
                {
                    // Update vehicle's changed date
                    Vehicle vehicle = await DbContext.Vehicles.Where(v => v.Id == vehicleId).FirstOrDefaultAsync();
                    if (vehicle != null)
                    {
                        vehicle.ChangedBy = currentUser;
                        vehicle.ChangedDate = changedDate;
                    }
                });
        }

        [HttpDelete]
        [Route("trip/{vehicleId}/gallery/{pictureSmallSizeId}")]
        public async Task<IActionResult> DeletePicture(int vehicleId, string pictureSmallSizeId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            Vehicle vehicle = await DbContext.Vehicles.Where(v => v.Id == vehicleId)
                .Include(v => v.Owner)
                .Include(v => v.ChangedBy)
                .Include(v => v.Gallery)
                .ThenInclude(g => g.Pictures)
                .FirstOrDefaultAsync();
            if (vehicle == null)
            {
                return NotFound();
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (
                    // Is allowed to edit vehicle if is admin or if it's his vehicle
                    (!currentUser.IsAdmin) && (vehicle.Owner?.Id != currentUser.Id)
               ))
            {
                return Forbid();
            }

            if (Guid.TryParse(pictureSmallSizeId, out Guid smallSizeId))
            {
                // Find the entity
                Picture pic = vehicle.Gallery?.Pictures?.FirstOrDefault(p => p.SmallSizeId == smallSizeId);
                if (pic == null)
                {
                    return NotFound();
                }

                // Delete picture data from data storage
                await EntityUtils.DeletePictureData(pic, Program.PictureStorage);
                // Delete picture record
                DbContext.Entry(pic).State = EntityState.Deleted;

                // Update vehicle's changed date
                vehicle.ChangedBy = currentUser;
                vehicle.ChangedDate = DateTime.Now;

                await DbContext.SaveChangesAsync();

                return Ok();
            }
            else
            {
                return NotFound();
            }
        }

        #endregion
    }
}

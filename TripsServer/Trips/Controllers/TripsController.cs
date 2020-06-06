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
    public class TripsController : TripsControllerBase
    {
        public TripsController(TripsContext dbContext, IMapper mapper)
            : base(dbContext, mapper)
        {
        }

        #region CRUD

        [HttpGet]
        [Route("trips")]
        public async Task<IList<TripHeaderDto>> GetTripsList(int? take, int? skip, string search, string from, string to)
        {
            var query = DbContext.Trips.AsQueryable();
            query = query.OrderByDescending(t => t.Date);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.Title.ToLower().Contains(search.ToLower()));
            }

            if (!string.IsNullOrEmpty(from))
            {
                if (StringUtils.TryParseDateParam(from, out DateTime dFrom))
                {
                    query = query.Where(t => t.Date >= dFrom);
                }
            }

            if (!string.IsNullOrEmpty(to))
            {
                if (StringUtils.TryParseDateParam(from, out DateTime dTo))
                {
                    dTo = dTo.AddDays(1);
                    query = query.Where(t => t.Date < dTo);
                }
            }

            if (skip.HasValue && (skip.Value > 0))
            {
                query = query.Skip(skip.Value);
            }

            if (take.HasValue && (take.Value > 0))
            {
                query = query.Take(take.Value);
            }

            List<Trip> fetchedData = await query.Include(t => t.TitlePicture)
                .Include(t => t.Participants)
                .ThenInclude((UsersToTrips utt) => utt.User)
                .ToListAsync();

            List<TripHeaderDto> result = fetchedData.Select(t => Mapper.Map<TripHeaderDto>(t)).ToList();
            return result;
        }

        [HttpGet]
        [Route("trip/{id}")]
        public async Task<TripDto> GetTrip(int id)
        {
            Trip trip = await DbContext.Trips.Where(t => t.Id == id)
                .Include(t => t.TitlePicture) // without UploadedBy
                .Include(t => t.AddedBy)
                .Include(t => t.ChangedBy)

                .Include(t => t.Gallery)
                .ThenInclude(g => g.Pictures)
                .ThenInclude((Picture pic) => pic.UploadedBy)

                .Include(t => t.Participants)
                .ThenInclude((UsersToTrips utt) => utt.User)
                // TODO vehicles
                .Include(t => t.Visits)
                .ThenInclude((Visit v) => v.Place)
                .ThenInclude(p => p.TitlePicture)

                .Include(t => t.Visits)
                .ThenInclude((Visit v) => v.Gallery)
                .ThenInclude(g => g.Pictures)
                .ThenInclude((Picture pic) => pic.UploadedBy)

                .FirstOrDefaultAsync();

            // Order pictures in galleries
            if (trip != null)
            {
                if (trip.Gallery?.Pictures != null)
                {
                    trip.Gallery.Pictures = trip.Gallery.Pictures.OrderBy(p => p.Index).ToList();
                }

                if (trip.Visits != null)
                {
                    foreach (Visit v in trip.Visits)
                    {
                        if (v?.Gallery?.Pictures != null)
                        {
                            v.Gallery.Pictures = v.Gallery.Pictures.OrderBy(p => p.Index).ToList();
                        }
                    }
                }
            }

            TripDto result = Mapper.Map<TripDto>(trip);
            return result;
        }

        [HttpPost]
        [Route("trips")]
        public async Task<TripDto> CreateTrip(int? placeId)
        {
            if (Program.IsLocked)
            {
                Response.StatusCode = StatusCodes.Status423Locked;
                return null;
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return null;
            }

            Place place = await DbContext.Places.Where(p => p.Id == placeId)
                .Include(p => p.TitlePicture).FirstOrDefaultAsync();
            if (place == null)
            {
                Response.StatusCode = StatusCodes.Status404NotFound;
                return null;
            }

            // Create trip
            DateTime nowDate = DateTime.Now;

            Trip trip = new Trip();
            trip.Title = place.Name;
            trip.Date = nowDate;
            trip.Gallery = new Gallery();
            trip.Gallery.Owner = GalleryOwner.Trip;
            trip.AddedBy = currentUser;
            trip.AddedDate = nowDate;

            Visit visit = new Visit();
            visit.Place = place;
            visit.Gallery = new Gallery();
            visit.Gallery.Owner = GalleryOwner.Visit;
            
            trip.Visits = new List<Visit>();
            trip.Visits.Add(visit);

            DbContext.Add(trip);
            await DbContext.SaveChangesAsync();

            // Update gallery owner Id
            trip.Gallery.OwnerId = trip.Id;
            visit.Gallery.OwnerId = visit.Id;
            await DbContext.SaveChangesAsync();

            TripDto result = Mapper.Map<TripDto>(trip);
            return result;
        }

        /// <summary>
        /// </summary>
        /// <param name="dto">Gallery is optional, null means no changes in gallery.
        /// Visits are optional, null means no changes in visits.
        /// Galleries within visits are also optional with the same meaning.
        /// Add/Remove participants, vehicles and visits - not by this action.
        /// </param>
        [HttpPut]
        [Route("trip")]
        public async Task<IActionResult> UpdateTrip(TripDto dto)
        {
            if (dto == null)
            {
                return BadRequest("MISSING_PARAMS");
            }

            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            // We might now decide not to load galleries because dto contains nulls,
            // but then find out that title picture changed, and then load each gallery one by one.
            // So we load all the galleries at the first time to avoid possible headache.
            Trip trip = await DbContext.Trips.Where(t => t.Id == dto.Id)
                .Include(t => t.TitlePicture)
                .Include(t => t.ChangedBy)

                .Include(t => t.Gallery)
                .ThenInclude(g => g.Pictures)

                .Include(t => t.Visits)
                .ThenInclude((Visit v) => v.Place)

                .Include(t => t.Visits)
                .ThenInclude((Visit v) => v.Gallery)
                .ThenInclude(g => g.Pictures)

                .FirstOrDefaultAsync();

            if (trip == null)
            {
                return NotFound();
            }

            //----------------- Apply changes

            trip.Title = dto.Title;
            trip.Description = dto.Description;
            trip.Date = dto.Date;
            if (dto.TitlePicture?.SmallSizeId != trip.TitlePicture?.SmallSizeId)
            {
                if (dto.TitlePicture == null)
                {
                    trip.TitlePicture = null;
                }
                else
                {
                    // Find in all galleries we have
                    Picture correspondingEntity = trip.Gallery?.Pictures?.FirstOrDefault(p => p.SmallSizeId == dto.TitlePicture.SmallSizeId);
                    if ((correspondingEntity == null) && (trip.Visits != null))
                    {
                        foreach (Visit visit in trip.Visits)
                        {
                            correspondingEntity = visit.Gallery?.Pictures?.FirstOrDefault(p => p.SmallSizeId == dto.TitlePicture.SmallSizeId);
                            if (correspondingEntity != null)
                            {
                                break;
                            }
                        }
                    }

                    if (correspondingEntity != null)
                    {
                        trip.TitlePicture = correspondingEntity;
                    }
                }
            }

            EntityUtils.ApplyChangesToGallery(trip.Gallery, dto.Gallery);
            foreach (Visit visit in trip.Visits)
            {
                await ApplyChangesToVisit(visit, dto.Visits?.FirstOrDefault(v => v.Id == visit.Id));
            }

            trip.ChangedDate = DateTime.Now;
            trip.ChangedBy = currentUser;
            await DbContext.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete]
        [Route("trip/{id}")]
        public async Task<IActionResult> DeleteTrip(int id)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            Trip trip = await DbContext.Trips.Where(t => t.Id == id)
                .Include(t => t.Gallery)
                .ThenInclude(g => g.Pictures)
                .Include(t => t.Visits)
                .ThenInclude((Visit v) => v.Gallery)
                .ThenInclude(g => g.Pictures)
                .FirstOrDefaultAsync();

            if (trip == null)
            {
                return NotFound();
            }

            // Mark for deletion
            DbContext.Entry(trip).State = EntityState.Deleted;
            DbContext.Entry(trip.Gallery).State = EntityState.Deleted;
            // Purge data from pictures storage
            await EntityUtils.DeleteAllPicturesData(trip.Gallery, Program.PictureStorage);

            if (trip.Visits != null)
            {
                foreach (Visit visit in trip.Visits)
                {
                    // Mark for deletion
                    DbContext.Entry(visit).State = EntityState.Deleted;
                    DbContext.Entry(visit.Gallery).State = EntityState.Deleted;
                    // Purge data from pictures storage
                    await EntityUtils.DeleteAllPicturesData(visit.Gallery, Program.PictureStorage);
                }
            }

            await DbContext.SaveChangesAsync();

            return Ok();
        }

        #endregion

        #region Root Gallery

        [HttpPost]
        [Route("trip/{tripId}/gallery")]
        public async Task<IActionResult> UploadPicture(int tripId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            // Find gallery and remember its metadata
            var galleryData = await DbContext.Trips
                .Where(t => (t.Id == tripId) && (t.Gallery != null))
                .Select(t => new
                {
                    GalleryId = t.Gallery.Id,
                    LastPictureIndex = t.Gallery.Pictures.Max(p => (int?)p.Index)
                }).FirstOrDefaultAsync();
            if (galleryData == null)
            {
                return NotFound();
            }

            return await UploadPictureHandler(galleryData.GalleryId, galleryData.LastPictureIndex, currentUser,
                async (changedDate) =>
                {
                    // Update trip's changed date
                    Trip trip = await DbContext.Trips.Where(t => t.Id == tripId).FirstOrDefaultAsync();
                    if (trip != null)
                    {
                        trip.ChangedBy = currentUser;
                        trip.ChangedDate = changedDate;
                    }
                });
        }

        [HttpDelete]
        [Route("trip/{tripId}/gallery/{pictureSmallSizeId}")]
        public async Task<IActionResult> DeletePicture(int tripId, string pictureSmallSizeId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            if (Guid.TryParse(pictureSmallSizeId, out Guid smallSizeId))
            {
                Trip trip = await DbContext.Trips.Where(t => t.Id == tripId)
                    .Include(t => t.TitlePicture)
                    .Include(t => t.ChangedBy)
                    .Include(t => t.Gallery)
                    .ThenInclude(g => g.Pictures)
                    .FirstOrDefaultAsync();
                if (trip == null)
                {
                    return NotFound();
                }

                Picture pic = trip.Gallery?.Pictures.FirstOrDefault(p => p.SmallSizeId == smallSizeId);
                if (pic == null)
                {
                    return NotFound();
                }

                // Delete picture data from data storage
                await EntityUtils.DeletePictureData(pic, Program.PictureStorage);
                // Delete picture record
                DbContext.Entry(pic).State = EntityState.Deleted;

                // Who has modified
                trip.ChangedBy = currentUser;
                trip.ChangedDate = DateTime.Now;

                await DbContext.SaveChangesAsync();

                return Ok();
            }
            else
            {
                return NotFound();
            }
        }

        #endregion

        #region Participants

        [HttpPost]
        [Route("trip/{tripId}/participants")]
        public async Task<IActionResult> AddParticipant(int tripId, int? userId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            Trip trip = await DbContext.Trips.Where(t => t.Id == tripId)
                .Include(t => t.ChangedBy)
                .Include(t => t.Participants)
                .FirstOrDefaultAsync();
            if (trip == null)
            {
                return NotFound();
            }

            // What if already exists
            if (trip?.Participants.FirstOrDefault(utt => utt.UserId == userId) != null)
            {
                return Ok();
            }

            User addedUser = await DbContext.Users.Where(u => u.Id == userId).FirstOrDefaultAsync();
            if (addedUser == null)
            {
                return NotFound();
            }

            //---------------- Do add
            UsersToTrips utt = new UsersToTrips();
            utt.TripId = trip.Id;
            utt.UserId = addedUser.Id;
            trip.Participants.Add(utt);

            trip.ChangedBy = currentUser;
            trip.ChangedDate = DateTime.Now;

            await DbContext.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        [Route("trip/{tripId}/participant/{userId}")]
        public async Task<IActionResult> RemoveParticipant(int tripId, int userId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            Trip trip = await DbContext.Trips.Where(t => t.Id == tripId)
                .Include(t => t.ChangedBy)
                .Include(t => t.Participants)
                .FirstOrDefaultAsync();
            if (trip == null)
            {
                return NotFound();
            }

            UsersToTrips utt = trip.Participants?.Where(utt2 => utt2.UserId == userId).FirstOrDefault();
            if (utt == null)
            {
                return NotFound();
            }

            // Do delete
            DbContext.Entry(utt).State = EntityState.Deleted;
            trip.ChangedBy = currentUser;
            trip.ChangedDate = DateTime.Now;

            await DbContext.SaveChangesAsync();

            return Ok();
        }

        #endregion

        #region Visits

        [HttpPost]
        [Route("trip/{tripId}/visits")]
        public async Task<IActionResult> AddVisit(int tripId, int? placeId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            Trip trip = await DbContext.Trips.Where(t => t.Id == tripId)
                .Include(t => t.ChangedBy)
                .FirstOrDefaultAsync();
            if (trip == null)
            {
                return NotFound();
            }

            Place place = await DbContext.Places.Where(p => p.Id == placeId).FirstOrDefaultAsync();
            if (place == null)
            {
                return NotFound();
            }

            // Now everything ready, create a visit with gallery
            Visit visit = new Visit();
            visit.Trip = trip;
            visit.Place = place;
            visit.Gallery = new Gallery();
            visit.Gallery.Owner = GalleryOwner.Visit;
            DbContext.Visits.Add(visit);

            trip.ChangedBy = currentUser;
            trip.ChangedDate = DateTime.Now;

            await DbContext.SaveChangesAsync();

            // Update gallery owner id
            visit.Gallery.OwnerId = visit.Id;
            await DbContext.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        [Route("trip/{tripId}/visit/{visitId}")]
        public async Task<IActionResult> RemoveVisit(int tripId, int visitId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            Visit visit = await DbContext.Visits.Where(v => v.Id == visitId)
                .Include(v => v.Gallery)
                .ThenInclude(g => g.Pictures)
                .Include(v => v.Trip)
                .ThenInclude(t => t.ChangedBy)
                .FirstOrDefaultAsync();
            Trip trip = visit?.Trip;
            if ((visit == null) || (trip?.Id != tripId))
            {
                return NotFound();
            }

            // Delete pictures data from visit's gallery
            await EntityUtils.DeleteAllPicturesData(visit.Gallery, Program.PictureStorage);
            // Delete records
            DbContext.Entry(visit).State = EntityState.Deleted;
            DbContext.Entry(visit.Gallery).State = EntityState.Deleted;
            // Write changes author
            trip.ChangedBy = currentUser;
            trip.ChangedDate = DateTime.Now;

            await DbContext.SaveChangesAsync();

            return Ok();
        }

        [HttpPost]
        [Route("trip/{tripId}/visit/{visitId}/gallery")]
        public async Task<IActionResult> UploadVisitPicture(int tripId, int visitId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            // Find gallery and remember its metadata
            var visitGalleryData = await DbContext.Visits
                .Where(v => (v.Id == visitId) && (v.Gallery != null) && (v.Trip != null))
                .Select(v => new
                {
                    GalleryId = v.Gallery.Id,
                    LastPictureIndex = v.Gallery.Pictures.Max(p => (int?)p.Index),
                    TripId = v.Trip.Id
                }).FirstOrDefaultAsync();
            if ((visitGalleryData == null) || (visitGalleryData.TripId != tripId))
            {
                return NotFound();
            }

            return await UploadPictureHandler(visitGalleryData.GalleryId, visitGalleryData.LastPictureIndex, currentUser,
                async (changedDate) =>
                {
                    // Update trip's changed date
                    Trip trip = await DbContext.Trips.Where(t => t.Id == tripId).FirstOrDefaultAsync();
                    if (trip != null)
                    {
                        trip.ChangedBy = currentUser;
                        trip.ChangedDate = changedDate;
                    }
                });
        }

        [HttpDelete]
        [Route("trip/{tripId}/visit/{visitId}/gallery/{pictureSmallSizeId}")]
        public async Task<IActionResult> DeleteVisitPicture(int tripId, int visitId, string pictureSmallSizeId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            if (Guid.TryParse(pictureSmallSizeId, out Guid smallSizeId))
            {
                Visit visit = await DbContext.Visits.Where(v => v.Id == visitId)
                    .Include(v => v.Trip)
                    .ThenInclude(t => t.ChangedBy)
                    .Include(v => v.Gallery)
                    .ThenInclude(g => g.Pictures)
                    .FirstOrDefaultAsync();
                if ((visit == null) || (visit.Trip?.Id != tripId))
                {
                    return NotFound();
                }

                Picture pic = visit.Gallery?.Pictures?.FirstOrDefault(p => p.SmallSizeId == smallSizeId);
                if (pic == null)
                {
                    return NotFound();
                }

                // All ready and verified for deletion.

                // Picture data
                await EntityUtils.DeletePictureData(pic, Program.PictureStorage);
                // Picture record
                DbContext.Entry(pic).State = EntityState.Deleted;
                // Changed by
                visit.Trip.ChangedBy = currentUser;
                visit.Trip.ChangedDate = DateTime.Now;

                await DbContext.SaveChangesAsync();

                return Ok();
            }
            else
            {
                return NotFound();
            }
        }

        #endregion

        /// <summary>
        /// Applies changes from dto to the visit object.
        /// In some cases reads from database something, using current data context.
        /// </summary>
        private async Task ApplyChangesToVisit(Visit visit, VisitDto dto)
        {
            if ((visit != null) && (dto != null))
            {
                if (visit.Place?.Id != dto.Place?.Id)
                {
                    if (dto.Place == null)
                    {
                        visit.Place = null;
                    }
                    else
                    {
                        visit.Place = await DbContext.Places.Where(p => p.Id == dto.Place.Id).FirstOrDefaultAsync();
                    }
                }

                EntityUtils.ApplyChangesToGallery(visit.Gallery, dto.Gallery);

                visit.WithKebab = dto.WithKebab;
                visit.WithNightStay = dto.WithNightStay;
            }
        }
    }
}
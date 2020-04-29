using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Trips.Dtos;
using Trips.Entities;
using Trips.Entities.Pics;
using Trips.Utils;
using AutoMapper;

namespace Trips.Controllers
{
    [ApiController]
    public class PlacesController : TripsControllerBase
    {
        public PlacesController(TripsContext dbContext, IMapper mapper)
            : base(dbContext, mapper)
        {
        }

        #region CRUD

        [HttpGet]
        [Route("places")]
        public async Task<IList<PlaceHeaderDto>> GetPlacesList(string order, int? take, int? skip, string search)
        {
            var query = DbContext.Places.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()));
            }

            if (order?.ToLower() == "date")
            {
                query = query.OrderByDescending(p => p.DiscoveryDate);
            }
            else
            {
                query = query.OrderBy(p => p.Name.ToLower());
            }

            if (skip.HasValue && (skip.Value > 0))
            {
                query = query.Skip(skip.Value);
            }

            if (take.HasValue && (take.Value > 0))
            {
                query = query.Take(take.Value);
            }

            List<Place> placesList = await query.Include(p => p.TitlePicture).ToListAsync();
            List<PlaceHeaderDto> result = placesList.Select(p => Mapper.Map<PlaceHeaderDto>(p)).ToList();
            return result;
        }

        [HttpGet]
        [Route("place/{id}")]
        public async Task<PlaceDto> GetPlace(int id)
        {
            Place place = await DbContext.Places.Where(p => p.Id == id)
                                                // TODO REGION
                                                .Include(p => p.AddedBy)
                                                .Include(p => p.ChangedBy)
                                                .Include(p => p.Gallery)
                                                .ThenInclude(g => g.Pictures)
                                                .ThenInclude((Picture pic) => pic.UploadedBy)
                                                .FirstOrDefaultAsync();

            // Pictures in gallery entity are already ordered due to DB index.
            // No additional work is needed.

            PlaceDto result = Mapper.Map<PlaceDto>(place);
            return result;
        }

        [HttpPost]
        [Route("places")]
        public async Task<PlaceDto> CreatePlace()
        {
            // TODO check permissions

            // Create and insert entity
            Place place = new Place();
            place.AddedDate = DateTime.Now;
            // TODO ADDED BY
            place.Gallery = new Gallery();
            place.Gallery.Owner = GalleryOwner.Place;
            DbContext.Add<Place>(place);
            await DbContext.SaveChangesAsync();

            // Update Gallery Owner ID
            place.Gallery.OwnerId = place.Id;
            await DbContext.SaveChangesAsync();

            PlaceDto result = Mapper.Map<PlaceDto>(place);
            return result;
        }

        /// <summary>
        /// </summary>
        /// <param name="placeDto">Gallery in placeDto is optional. If omitted, means that
        /// no reordering is needed when processing this request.</param>
        [HttpPut]
        [Route("place")]
        public async Task<IActionResult> UpdatePlace(PlaceDto placeDto)
        {
            // TODO check permissions

            if (placeDto == null)
            {
                return BadRequest("MISSING_PARAMS");
            }

            // 1. ---------- Load place entity from DB
            bool loadedWithGallery = placeDto.Gallery != null;
            Place place = null;
            var query = DbContext.Places.Where(p => p.Id == placeDto.Id)
                                        .Include(p => p.Region)
                                        .Include(p => p.AddedBy)
                                        .Include(p => p.ChangedBy)
                                        .Include(p => p.TitlePicture);
            if (loadedWithGallery)
            {
                place = await query.Include(p => p.Gallery)
                                   .ThenInclude(g => g.Pictures)
                                   .FirstOrDefaultAsync();
            }
            else
            {
                place = await query.FirstOrDefaultAsync();
            }

            if (place == null)
            {
                return NotFound();
            }

            // 2. ---------- Set plain properties
            place.Kind = placeDto.Kind;
            place.Name = placeDto.Name;
            place.Description = placeDto.Description;
            place.Location = placeDto.Location;
            // TODO REGION
            place.DiscoveryDate = placeDto.DiscoveryDate;
            place.Accessibility = placeDto.Accessibility;
            place.NearestAccessibility = placeDto.NearestAccessibility;
            place.Popularity = placeDto.Popularity;
            place.Capacity = placeDto.Capacity;
            place.IsXBApproved = placeDto.IsXBApproved;

            // 3. ---------- Title picture
            if (place.TitlePicture?.SmallSizeId != placeDto.TitlePictureSmallSizeId)
            {
                if (placeDto.TitlePictureSmallSizeId == null)
                {
                    place.TitlePicture = null;
                }
                else
                {
                    // Need to search in gallery. Do we have gallery?
                    if (!loadedWithGallery)
                    {
                        // Yayks. Should have had.
                        await DbContext.Entry(place).Reference(p => p.Gallery).LoadAsync();
                        if (place.Gallery != null)
                        {
                            await DbContext.Entry(place.Gallery).Collection(g => g.Pictures).LoadAsync();
                        }
                    }

                    place.TitlePicture = place.Gallery?.Pictures?.FirstOrDefault(p =>
                        p.SmallSizeId == placeDto.TitlePictureSmallSizeId);
                }
            }

            // 4. ---------- Reorder pictures in the gallery
            EntityUtils.ReorderPicturesInTheGallery(place.Gallery, placeDto.Gallery);

            // 5. ---------- Changed By
            // TODO: USER!
            place.ChangedDate = DateTime.Now;

            await DbContext.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        [Route("place/{id}")]
        public async Task<IActionResult> DeletePlace(int id, [FromQuery] bool? deleteVisits)
        {
            // TODO check permissions

            Place place = await DbContext.Places.Where(p => p.Id == id)
                                                .Include(p => p.Gallery)
                                                .ThenInclude(g => g.Pictures)
                                                .FirstOrDefaultAsync();

            // Clear Visits
            if (deleteVisits == true)
            {
                await DbContext.Entry(place).Collection(p => p.Visits).LoadAsync();
                foreach (Visit visit in place.Visits)
                {
                    await DbContext.Entry(visit).Reference(v => v.Gallery).LoadAsync();
                    await DbContext.Entry(visit.Gallery).Collection(g => g.Pictures).LoadAsync();

                    // Clear PicsDB data for visit's gallery
                    PicsContext picsContext = new PicsContext();
                    EntityUtils.DeleteAllPicturesData(visit.Gallery, picsContext);
                    await picsContext.SaveChangesAsync();

                    // Now mark visit and it's gallery for deletion
                    DbContext.Entry(visit.Gallery).State = EntityState.Deleted;
                    DbContext.Entry(visit).State = EntityState.Deleted;
                }

                // Delete visits
                await DbContext.SaveChangesAsync();
            }

            // Clear PicsDB data for our gallery
            PicsContext picsContext2 = new PicsContext();
            EntityUtils.DeleteAllPicturesData(place.Gallery, picsContext2);
            await picsContext2.SaveChangesAsync();

            // Finally, delete the place with its gallery
            DbContext.Entry(place.Gallery).State = EntityState.Deleted;
            DbContext.Entry(place).State = EntityState.Deleted;
            await DbContext.SaveChangesAsync();

            return Ok();
        }

        #endregion

        #region Gallery Management

        /// <summary>
        /// Upload to the gallery
        /// </summary>
        [HttpPost]
        [Route("place/{id}/gallery")]
        public async Task<PictureDto> UploadPicture(int id)
        {
            return new PictureDto();
        }

        /// <summary>
        /// Delete from the gallery
        /// </summary>
        /// <param name="placeId"></param>
        /// <param name="pictureSmallSizeId"></param>
        [HttpDelete]
        [Route("place/{placeId}/gallery/{pictureId}")]
        public async Task<IActionResult> DeletePicture(int placeId, string pictureSmallSizeId)
        {
            return Ok();
        }

        #endregion

        #region Visits by place

        [HttpGet]
        [Route("place/{id}/visits")]
        public async Task<IList<VisitForPlaceDto>> GetVisitsForPlace(int id, int? take, int? skip)
        {
            var query = DbContext.Visits.Where(v => v.Place.Id == id)
                                        .OrderByDescending(v => v.Trip.Date)
                                        .Select(v => new
                                        {
                                            TripId = v.Trip.Id,
                                            TripDate = v.Trip.Date,
                                            Participants = v.Trip.Users.Select(u => u.User)
                                        });
            if (skip.HasValue)
            {
                query = query.Skip(skip.Value);
            }

            if (take.HasValue)
            {
                query = query.Take(take.Value);
            }

            var fetchedList = await query.ToListAsync();

            List<VisitForPlaceDto> result = fetchedList.Select(obj => new VisitForPlaceDto()
            {
                TripId = obj.TripId,
                TripDate = obj.TripDate,
                Participants = obj.Participants.Select(u => Mapper.Map<UserHeaderDto>(u)).ToList()
            }).ToList();

            return result;
        }

        #endregion
    }
}
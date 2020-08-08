using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
    public class PlacesController : TripsControllerBase
    {
        class PlaceWithMetric<T>
        {
            public Place Place { get; set; }
            public T Metric { get; set; }
        }

        public PlacesController(TripsContext dbContext, IMapper mapper)
            : base(dbContext, mapper)
        {
        }

        #region CRUD

        [HttpGet]
        [Route("places")]
        public async Task<IList<PlaceHeaderDto>> GetPlacesList(string order, int? take, int? skip, string search, string kind, string exact)
        {
            var query = DbContext.Places.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()));
            }

            if (!string.IsNullOrEmpty(kind))
            {
                string[] filterParts = kind.ToLower().Split(new char[] { '|' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim()).ToArray();
                var enumMembers = ((PlaceKind[])Enum.GetValues(typeof(PlaceKind)))
                    .Select(pk => new { Value = pk, Str = pk.ToString().ToLower() });
                
                List<PlaceKind?> placeKindsForFilter = enumMembers
                    .Where(em => filterParts.Contains(em.Str))
                    .Select(em => (PlaceKind?)em.Value).ToList();
                if (filterParts.Contains("null"))
                {
                    placeKindsForFilter.Add(null);
                }

                query = query.Where(p => placeKindsForFilter.Contains(p.Kind));
            }

            List<int> placeIds = null;
            if (!string.IsNullOrEmpty(exact))
            {
                placeIds = StringUtils.ParseIds(exact, '|');
                if (placeIds.Count > 0)
                {
                    query = query.Where(p => placeIds.Contains(p.Id));
                }
            }

            if (order?.ToLower() == "date")
            {
                query = query.OrderByDescending(p => p.DiscoveryDate).ThenByDescending(p => p.Id);
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

            // If queried with "exact" option - override the order according to requested
            if ((placeIds != null) && (placeIds.Count > 0))
            {
                placesList = EntityUtils.OrderByIds(placesList, placeIds);
            }

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

            if (place?.Gallery?.Pictures != null)
            {
                // Order by index
                place.Gallery.Pictures = place.Gallery.Pictures.OrderBy(p => p.Index).ToList();
            }

            PlaceDto result = Mapper.Map<PlaceDto>(place);
            return result;
        }

        [HttpGet]
        [Route("places/onmap")]
        public async Task<IList<PlaceOnMapDto>> GetPlacesOnMap()
        {
            List<Place> places = await DbContext.Places.Where(p => p.Latitude.HasValue && p.Longitude.HasValue)
                                                       .Include(p => p.TitlePicture)
                                                       .ToListAsync();
            List<PlaceOnMapDto> result = places.Select(p => Mapper.Map<PlaceOnMapDto>(p)).ToList();
            return result;
        }

        [HttpGet]
        [Route("places/stats")]
        public async Task<PlacesStatsDto> GetPlacesStats()
        {
            PlacesStatsDto result = new PlacesStatsDto();

            var visited = await DbContext.Places
                .Include(p => p.TitlePicture)
                .Select(p => new PlaceWithMetric<int>
                {
                    Place = p,
                    // Only one time per trip counts
                    Metric = p.Visits.Where(v => v.Trip != null).Select(v => v.Trip.Id).Distinct().Count()
                })
                .Where(rec => rec.Metric > 0) // No point to include "0" records in the rating
                .OrderByDescending(rec => rec.Metric)
                .ToListAsync();

            result.MostVisited = GroupByMetricAndSelectFirst(visited, 5);

            var nightStay = await DbContext.Places
                .Include(p => p.TitlePicture)
                .Select(p => new PlaceWithMetric<int>
                {
                    Place = p,
                    // Only one night stay per trip counts
                    Metric = p.Visits.Where(v => (v.Trip != null) && v.WithNightStay).Select(v => v.Trip.Id).Distinct().Count()
                })
                .Where(rec => rec.Metric > 0) // No point to include "0" records in the rating
                .OrderByDescending(rec => rec.Metric)
                .ToListAsync();

            result.MostNightStay = GroupByMetricAndSelectFirst(nightStay, 5);

            return result;
        }

        [HttpPost]
        [Route("places")]
        public async Task<PlaceDto> CreatePlace()
        {
            if (Program.IsLocked)
            {
                Response.StatusCode = StatusCodes.Status423Locked;
                return null;
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanEditGeography))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return null;
            }

            // Create and insert entity
            Place place = new Place();
            place.AddedBy = currentUser;
            place.AddedDate = DateTime.Now;
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
            if (placeDto == null)
            {
                return BadRequest("MISSING_PARAMS");
            }

            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanEditGeography))
            {
                return Forbid();
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
            place.Latitude = placeDto.Latitude;
            place.Longitude = placeDto.Longitude;
            // TODO REGION
            place.DiscoveryDate = placeDto.DiscoveryDate;
            place.Accessibility = placeDto.Accessibility;
            place.NearestAccessibility = placeDto.NearestAccessibility;
            place.Popularity = placeDto.Popularity;
            place.Capacity = placeDto.Capacity;
            place.IsXBApproved = placeDto.IsXBApproved;

            // 3. ---------- Title picture
            if (place.TitlePicture?.SmallSizeId != placeDto.TitlePicture?.SmallSizeId)
            {
                if (placeDto.TitlePicture == null)
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
                        p.SmallSizeId == placeDto.TitlePicture.SmallSizeId);
                }
            }

            // 4. ---------- Changes in the gallery
            EntityUtils.ApplyChangesToGallery(place.Gallery, placeDto.Gallery);

            // 5. ---------- Changed By
            place.ChangedBy = currentUser;
            place.ChangedDate = DateTime.Now;

            await DbContext.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        [Route("place/{id}")]
        public async Task<IActionResult> DeletePlace(int id, [FromQuery] bool? deleteVisits)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanEditGeography))
            {
                return Forbid();
            }

            // For deleting visits there should be "edit trips" privilege
            if ((deleteVisits == true) && (!currentUser.CanPublishTrips))
            {
                return Forbid();
            }

            Place place = await DbContext.Places.Where(p => p.Id == id)
                                                .Include(p => p.Gallery)
                                                .ThenInclude(g => g.Pictures)
                                                .FirstOrDefaultAsync();
            if (place == null)
            {
                return NotFound();
            }

            // Clear Visits
            if (deleteVisits == true)
            {
                await DbContext.Entry(place).Collection(p => p.Visits).LoadAsync();
                foreach (Visit visit in place.Visits)
                {
                    await DbContext.Entry(visit).Reference(v => v.Gallery).LoadAsync();
                    await DbContext.Entry(visit.Gallery).Collection(g => g.Pictures).LoadAsync();

                    // Clear pictures data for visit's gallery
                    await EntityUtils.DeleteAllPicturesData(visit.Gallery, Program.PictureStorage);

                    // Now mark visit and its gallery for deletion
                    DbContext.Entry(visit.Gallery).State = EntityState.Deleted;
                    DbContext.Entry(visit).State = EntityState.Deleted;
                }

                // Delete visits
                await DbContext.SaveChangesAsync();
            }

            // Clear pictures data for our gallery
            await EntityUtils.DeleteAllPicturesData(place.Gallery, Program.PictureStorage);

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
        public async Task<IActionResult> UploadPicture(int id)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanEditGeography))
            {
                return Forbid();
            }

            // Find gallery and remember its metadata
            var galleryData = await DbContext.Places
                .Where(p => (p.Id == id) && (p.Gallery != null))
                .Select(p => new
                {
                    GalleryId = p.Gallery.Id,
                    LastPictureIndex = p.Gallery.Pictures.Max(p => (int?)p.Index)
                }).FirstOrDefaultAsync();
            if (galleryData == null)
            {
                return NotFound();
            }

            return await UploadPictureHandler(galleryData.GalleryId, galleryData.LastPictureIndex, currentUser, async (changedDate) =>
            {
                // Update place's changed date
                Place place = await DbContext.Places.Where(p => p.Id == id).FirstOrDefaultAsync();
                if (place != null)
                {
                    place.ChangedDate = changedDate;
                    place.ChangedBy = currentUser;
                }
            });
        }

        /// <summary>
        /// Delete from the gallery
        /// </summary>
        /// <param name="placeId"></param>
        /// <param name="pictureSmallSizeId"></param>
        [HttpDelete]
        [Route("place/{placeId}/gallery/{pictureSmallSizeId}")]
        public async Task<IActionResult> DeletePicture(int placeId, string pictureSmallSizeId)
        {
            if (Program.IsLocked)
            {
                return StatusCode(StatusCodes.Status423Locked);
            }

            // Check permissions
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.CanEditGeography))
            {
                return Forbid();
            }

            if (Guid.TryParse(pictureSmallSizeId, out Guid smallSizeId))
            {
                Place place = await DbContext.Places
                                .Where(p => p.Id == placeId)
                                .Include(p => p.TitlePicture)
                                .Include(p => p.Gallery)
                                .ThenInclude(g => g.Pictures).FirstOrDefaultAsync();
                if (place == null)
                {
                    return NotFound();
                }

                Picture pictureEntry = place.Gallery.Pictures?.FirstOrDefault(p => p.SmallSizeId == smallSizeId);
                if (pictureEntry == null)
                {
                    return NotFound();
                }

                // Delete picture data from storage
                await EntityUtils.DeletePictureData(pictureEntry, Program.PictureStorage);

                // Delete from the main DB
                DbContext.Entry(pictureEntry).State = EntityState.Deleted;
                if (pictureEntry.Id == place.TitlePicture?.Id)
                {
                    place.TitlePicture = null;
                }

                // Update place's changed date
                place.ChangedDate = DateTime.Now;
                place.ChangedBy = currentUser;

                await DbContext.SaveChangesAsync();

                return Ok();
            }
            else
            {
                return NotFound();
            }
        }

        #endregion

        private List<PlacesMetricDto<T>> GroupByMetricAndSelectFirst<T>(IList<PlaceWithMetric<T>> orderedList, int maxCount)
        {
            List<PlacesMetricDto<T>> result = new List<PlacesMetricDto<T>>();
            PlacesMetricDto<T> currentPlaceGroup = null;

            for (int i=0; i<orderedList.Count; i++)
            {
                if ((currentPlaceGroup == null) || (!orderedList[i].Metric.Equals(currentPlaceGroup.Metric)))
                {
                    if (currentPlaceGroup != null)
                    {
                        result.Add(currentPlaceGroup);
                        if ((maxCount > 0) && (result.Count >= maxCount))
                        {
                            currentPlaceGroup = null;
                            break;
                        }
                    }

                    currentPlaceGroup = new PlacesMetricDto<T>
                    {
                        Places = new List<PlaceHeaderDto>(),
                        Metric = orderedList[i].Metric
                    };
                }

                currentPlaceGroup.Places.Add(Mapper.Map<PlaceHeaderDto>(orderedList[i].Place));
            }

            if (currentPlaceGroup != null)
            {
                result.Add(currentPlaceGroup);
            }

            return result;
        }
    }
}
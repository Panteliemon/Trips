﻿using System;
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
        public PlacesController(TripsContext dbContext, IMapper mapper)
            : base(dbContext, mapper)
        {
        }

        #region CRUD

        [HttpGet]
        [Route("places")]
        public async Task<IList<PlaceHeaderDto>> GetPlacesList(string order, int? take, int? skip, string search, string kind)
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

            if (place?.Gallery?.Pictures != null)
            {
                // Order by index
                place.Gallery.Pictures = place.Gallery.Pictures.OrderBy(p => p.Index).ToList();
            }

            PlaceDto result = Mapper.Map<PlaceDto>(place);
            return result;
        }

        [HttpPost]
        [Route("places")]
        public async Task<PlaceDto> CreatePlace()
        {
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

            // 4. ---------- Reorder pictures in the gallery
            EntityUtils.ReorderPicturesInTheGallery(place.Gallery, placeDto.Gallery);

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
        public async Task<IActionResult> UploadPicture(int id)
        {
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

                    // Insert data into Pics DB
                    PicsContext picsDb = new PicsContext();

                    PicData largeSizeEntry = new PicData();
                    largeSizeEntry.Id = Guid.NewGuid();
                    largeSizeEntry.Format = format;
                    largeSizeEntry.Data = pictureData.LargeSizeData;
                    await picsDb.AddAsync(largeSizeEntry);

                    PicData mediumSizeEntry = largeSizeEntry;
                    if (pictureData.MediumSizeData != pictureData.LargeSizeData)
                    {
                        mediumSizeEntry = new PicData();
                        mediumSizeEntry.Id = Guid.NewGuid();
                        mediumSizeEntry.Format = format;
                        mediumSizeEntry.Data = pictureData.MediumSizeData;
                        await picsDb.AddAsync(mediumSizeEntry);
                    }

                    PicData smallSizeEntry = mediumSizeEntry;
                    if (pictureData.SmallSizeData != pictureData.MediumSizeData)
                    {
                        smallSizeEntry = new PicData();
                        smallSizeEntry.Id = Guid.NewGuid();
                        smallSizeEntry.Format = format;
                        smallSizeEntry.Data = pictureData.SmallSizeData;
                        await picsDb.AddAsync(smallSizeEntry);
                    }

                    await picsDb.SaveChangesAsync();

                    // Insert picture data into Trips DB
                    Picture pictureEntry = new Picture();
                    pictureEntry.GalleryId = galleryData.GalleryId;
                    pictureEntry.Index = galleryData.LastPictureIndex.HasValue
                        ? galleryData.LastPictureIndex.Value + 1 : 1; // Indexes in gallery start from 1.
                    pictureEntry.SmallSizeId = smallSizeEntry.Id;
                    pictureEntry.MediumSizeId = mediumSizeEntry.Id;
                    pictureEntry.LargeSizeId = largeSizeEntry.Id;
                    pictureEntry.DateTaken = pictureData.DateTaken;
                    pictureEntry.DateUploaded = DateTime.Now;
                    pictureEntry.UploadedBy = currentUser;
                    pictureEntry.Height = pictureData.Height;
                    pictureEntry.Width = pictureData.Width;

                    await DbContext.Pictures.AddAsync(pictureEntry);

                    // Update place's changed date
                    Place place = await DbContext.Places.Where(p => p.Id == id).FirstOrDefaultAsync();
                    if (place != null)
                    {
                        place.ChangedDate = pictureEntry.DateUploaded;
                        place.ChangedBy = currentUser;
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

        /// <summary>
        /// Delete from the gallery
        /// </summary>
        /// <param name="placeId"></param>
        /// <param name="pictureSmallSizeId"></param>
        [HttpDelete]
        [Route("place/{placeId}/gallery/{pictureSmallSizeId}")]
        public async Task<IActionResult> DeletePicture(int placeId, string pictureSmallSizeId)
        {
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

                // Delete picture data from Pics DB
                PicsContext picsDb = new PicsContext();
                EntityUtils.DeletePictureData(pictureEntry, picsDb);
                await picsDb.SaveChangesAsync();

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
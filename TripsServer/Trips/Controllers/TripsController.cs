using System;
using System.Collections.Generic;
using System.Linq;
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
    [ApiController]
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

        //[HttpPost]
        //[Route("trips")]
        //public async Task<TripDto> CreateTrip(int? placeId)
        //{

        //}

        #endregion
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Trips.Entities;
using Trips.Dtos;

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
        public async Task<IList<TripDto>> GetTripsList(int? take, int? skip, string search, string usersFilter)
        {
            var query = DbContext.Trips.AsQueryable();
            query = query.OrderByDescending(t => t.Date);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.Title.ToLower().Contains(search.ToLower()));
            }

            if (!string.IsNullOrEmpty(usersFilter))
            {
                // TODO
            }

            if (skip.HasValue && (skip.Value > 0))
            {
                query = query.Skip(skip.Value);
            }

            if (take.HasValue && (take.Value > 0))
            {
                query = query.Take(take.Value);
            }

            List<Trip> fetchedData = await query.ToListAsync();
                              // TODO INCLUDE!!!

            List<TripDto> result = fetchedData.Select(t => Mapper.Map<TripDto>(t)).ToList();
            return result;
        }

        #endregion
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Trips.Entities;

namespace Trips.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlacesController : ControllerBase
    {
        TripsContext _dbContext;

        public PlacesController(TripsContext dbContext)
        {
            _dbContext = dbContext;
        }

    }
}
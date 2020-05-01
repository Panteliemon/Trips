using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using Trips.Entities;
using Trips.Entities.Pics;

namespace Trips.Controllers
{
    [ApiController]
    public class PingController : TripsControllerBase
    {
        public PingController(TripsContext dbContext, IMapper mapper)
            : base(dbContext, mapper)
        {
        }

        [Route("ping")]
        public IActionResult GetTestMessage()
        {
            StringBuilder response = new StringBuilder();
            response.AppendLine("- General Kenobi!");
            response.AppendLine("Api werks");

            try
            {
                int usersCount = DbContext.Users.Count();
                response.AppendLine("TripsDB werks");
            }
            catch (Exception ex)
            {
                response.AppendLine("TripsDB doesn't work: " + ex.ToString());
            }

            try
            {
                PicsContext picsDb = new PicsContext();
                int picsCount = picsDb.PicData.Count();
                response.AppendLine("PicsDB werks");
            }
            catch (Exception ex)
            {
                response.AppendLine("PicsDB doesn't work: " + ex.ToString());
            }

            return Ok(response.ToString());
        }
    }
}
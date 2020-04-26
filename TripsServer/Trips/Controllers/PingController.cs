using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Trips.Controllers
{
    [ApiController]
    public class PingController : ControllerBase
    {
        [Route("ping")]
        public IActionResult GetTestMessage()
        {
            return new JsonResult("General Kenobi!");
        }
    }
}
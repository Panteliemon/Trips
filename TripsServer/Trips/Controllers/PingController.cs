using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
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

            try
            {
                const string buildDatePrefix = "+build";

                var currentAssembly = Assembly.GetExecutingAssembly();
                var attribute = currentAssembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>();
                int index1 = attribute.InformationalVersion.IndexOf(buildDatePrefix);
                if (index1 >= 0)
                {
                    string dateSubStr = attribute.InformationalVersion.Substring(index1 + buildDatePrefix.Length);
                    response.AppendLine("Build " + dateSubStr);
                }
                else
                {
                    response.AppendLine("[!] Failed to get build date");
                }
            }
            catch (Exception)
            {
                response.AppendLine("[x] Failed to get build date");
            }

            if (Program.ClientUrl.ToLower().Contains("localhost"))
            {
                response.AppendLine("[!] Client is running on localhost");
            }

            if (!Program.TripsConnectionString.ToLower().Contains("server="))
            {
                response.AppendLine("[!] TripsDB uses local DB");
            }

            try
            {
                int usersCount = DbContext.Users.Count();
                response.AppendLine("TripsDB werks");
            }
            catch (Exception ex)
            {
                response.AppendLine("[x] TripsDB doesn't work: " + ex.ToString());
            }

            if (!Program.PicsConnectionString.ToLower().Contains("server="))
            {
                response.AppendLine("[!] PicsDB uses local DB");
            }

            try
            {
                PicsContext picsDb = new PicsContext();
                int picsCount = picsDb.PicData.Count();
                response.AppendLine("PicsDB werks");
            }
            catch (Exception ex)
            {
                response.AppendLine("[x] PicsDB doesn't work: " + ex.ToString());
            }

            return Ok(response.ToString());
        }
    }
}
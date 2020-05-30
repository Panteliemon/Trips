using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class ServiceOperationDto
    {
        public string Key { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime? LastStarted { get; set; }
        public DateTime? LastEnded { get; set; }
        public ServiceOperationResult? LastResult { get; set; }
    }
}

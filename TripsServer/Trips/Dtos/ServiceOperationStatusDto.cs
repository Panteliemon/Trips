using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class ServiceOperationStatusDto
    {
        public int OperationId { get; set; }
        public string Key { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime? StartTime { get; set; }
        public long Total { get; set; }
        public long Done { get; set; }
        public ServiceOperationResult? Result { get; set; }
        public DateTime? FinishTime { get; set; }
    }
}

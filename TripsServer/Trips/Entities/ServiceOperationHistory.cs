using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class ServiceOperationHistory
    {
        public int Id { get; set; }
        public string Key { get; set; }
        public DateTime Started { get; set; }
        public DateTime Ended { get; set; }
        public ServiceOperationResult Result { get; set; }
        public string Output { get; set; }
    }
}

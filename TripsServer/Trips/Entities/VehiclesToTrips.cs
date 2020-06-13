using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class VehiclesToTrips
    {
        public int VehicleId { get; set; }
        public Vehicle Vehicle { get; set; }

        public int TripId { get; set; }
        public Trip Trip { get; set; }

        public int Index { get; set; }
    }
}

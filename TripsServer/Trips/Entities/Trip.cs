using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class Trip
    {
        public int Id { get; set; }
        public DateTime? Date { get; set; }
        public Gallery Gallery { get; set; }

        public ICollection<UsersToTrips> Users { get; set; }
        public ICollection<VehiclesToTrips> Vehicles { get; set; }
        public ICollection<Visit> Visits { get; set; }
    }
}

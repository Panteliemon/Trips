using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class UsersToTrips
    {
        public int UserId { get; set; }
        public User User { get; set; }

        public int TripId { get; set; }
        public Trip Trip { get; set; }
    }
}

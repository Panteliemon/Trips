using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class Trip
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? Date { get; set; }
        public Picture TitlePicture { get; set; }
        public Gallery Gallery { get; set; }

        public ICollection<UsersToTrips> Participants { get; set; }
        public ICollection<VehiclesToTrips> Vehicles { get; set; }
        public ICollection<Visit> Visits { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class Vehicle
    {
        public int Id { get; set; }
        public User Owner { get; set; }
        public string Name { get; set; }
        public string OfficialName { get; set; }
        public string Description { get; set; }
        public string LicenseNumber { get; set; }
        public int? YearOfManufacture { get; set; }
        public PlaceAccessibility? AcceptableAccessibility { get; set; }
        public Gallery Gallery { get; set; }
        public Picture TitlePicture { get; set; }

        public User AddedBy { get; set; }
        public DateTime? AddedDate { get; set; }
        public User ChangedBy { get; set; }
        public DateTime? ChangedDate { get; set; }

        public ICollection<VehiclesToTrips> Trips { get; set; }
    }
}

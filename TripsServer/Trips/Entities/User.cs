using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities.Pics;

namespace Trips.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string HashedPassword { get; set; }
        public DateTime? RegisteredDate { get; set; }
        public DateTime? LastChangedName { get; set; }
        public Guid? ProfilePicture { get; set; }
        public Guid? SmallSizeProfilePicture { get; set; }
        public PicFormat? ProfilePictureFormat { get; set; }

        public bool IsAdmin { get; set; }
        public bool CanPublishNews { get; set; }
        public bool CanPublishTrips { get; set; }
        public bool CanEditGeography { get; set; }

        public ICollection<UsersToTrips> Trips { get; set; }
        public ICollection<Vehicle> Vehicles { get; set; }
        public ICollection<Picture> UploadedPics { get; set; }

        public ICollection<News> PostedNews { get; set; }
        public ICollection<News> EditedNews { get; set; }
        public ICollection<Place> AddedPlaces { get; set; }
        public ICollection<Place> ChangedPlaces { get; set; }
        public ICollection<Region> AddedRegions { get; set; }
        public ICollection<Region> ChangedRegions { get; set; }
        public ICollection<Trip> AddedTrips { get; set; }
        public ICollection<Trip> ChangedTrips { get; set; }
        public ICollection<Vehicle> AddedVehicles { get; set; }
        public ICollection<Vehicle> ChangedVehicles { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class PlaceDto
    {
        public int Id { get; set; }
        public string UrlId { get; set; }
        public PlaceKind? Kind { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public UserHeaderDto AddedBy { get; set; }
        public DateTime? AddedDate { get; set; }
        public UserHeaderDto ChangedBy { get; set; }
        public DateTime? ChangedDate { get; set; }

        public DateTime? DiscoveryDate { get; set; }
        public PlaceAccessibility? Accessibility { get; set; }
        public PlaceAccessibility? NearestAccessibility { get; set; }
        public PlacePopularity? Popularity { get; set; }
        public PlaceCapacity? Capacity { get; set; }
        public bool IsXBApproved { get; set; }

        public PictureDto TitlePicture { get; set; }
        public GalleryDto Gallery { get; set; }
    }
}

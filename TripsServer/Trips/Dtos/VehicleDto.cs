using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class VehicleDto
    {
        public int Id { get; set; }
        public UserHeaderDto Owner { get; set; }
        public string Name { get; set; }
        public string OfficialName { get; set; }
        public string Description { get; set; }
        public string LicenseNumber { get; set; }
        public int? YearOfManufacture { get; set; }
        public PlaceAccessibility? AcceptableAccessibility { get; set; }
        public GalleryDto Gallery { get; set; }
        public PictureDto TitlePicture { get; set; }

        public UserHeaderDto AddedBy { get; set; }
        public DateTime? AddedDate { get; set; }
        public UserHeaderDto ChangedBy { get; set; }
        public DateTime? ChangedDate { get; set; }
    }
}

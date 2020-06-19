using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    public class TripDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? Date { get; set; }
        public PictureDto TitlePicture { get; set; }
        public GalleryDto Gallery { get; set; }

        public UserHeaderDto AddedBy { get; set; }
        public DateTime? AddedDate { get; set; }
        public UserHeaderDto ChangedBy { get; set; }
        public DateTime? ChangedDate { get; set; }

        public List<UserHeaderDto> Participants { get; set; }
        public List<VehicleHeaderDto> Vehicles { get; set; }
        public List<VisitDto> Visits { get; set; }
    }
}

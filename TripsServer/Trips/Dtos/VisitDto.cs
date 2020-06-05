using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    public class VisitDto
    {
        public int Id { get; set; }
        public PlaceHeaderDto Place { get; set; }
        public GalleryDto Gallery { get; set; }

        public bool WithKebab { get; set; }
        public bool WithNightStay { get; set; }
    }
}

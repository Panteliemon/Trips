using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class PlaceHeaderDto
    {
        public int Id { get; set; }
        public PlaceKind? Kind { get; set; }
        public string Name { get; set; }
        public DateTime? DiscoveryDate { get; set; }
        public PlaceAccessibility? Accessibility { get; set; }
        public PlacePopularity? Popularity { get; set; }
        public Guid? TitlePictureSmallSizeId { get; set; }
    }
}

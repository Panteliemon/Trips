using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class PlaceOnMapDto
    {
        public int Id { get; set; }
        public PlaceKind? Kind { get; set; }
        public string Name { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public PicFormat? TitlePictureFormat { get; set; }
        public Guid? TitlePictureSmallSizeId { get; set; }
    }
}

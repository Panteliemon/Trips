using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class VehicleHeaderDto
    {
        public int Id { get; set; }
        public UserHeaderDto Owner { get; set; }
        public string Name { get; set; }
        public PlaceAccessibility? AcceptableAccessibility { get; set; }
        public Guid? TitlePictureSmallSizeId { get; set; }
        public PicFormat? TitlePictureFormat { get; set; }
    }
}

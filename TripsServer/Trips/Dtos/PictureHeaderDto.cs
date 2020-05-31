using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    // Not used?
    public class PictureHeaderDto
    {
        public PicFormat Format { get; set; }
        public Guid SmallSizeId { get; set; }
        public Guid MediumSizeId { get; set; }
        public Guid LargeSizeId { get; set; }
    }
}

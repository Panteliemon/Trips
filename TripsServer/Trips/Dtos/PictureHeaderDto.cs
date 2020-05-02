using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    public class PictureHeaderDto
    {
        public Guid SmallSizeId { get; set; }
        public Guid MediumSizeId { get; set; }
        public Guid LargeSizeId { get; set; }
    }
}

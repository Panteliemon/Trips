using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class PictureDto
    {
        public PicFormat Format { get; set; }
        public Guid SmallSizeId { get; set; }
        public Guid MediumSizeId { get; set; }
        public Guid LargeSizeId { get; set; }
        public DateTime? DateTaken { get; set; }
        public DateTime? DateUploaded { get; set; }
        public UserHeaderDto UploadedBy { get; set; }
        public string Description { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
    }
}

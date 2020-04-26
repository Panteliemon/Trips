using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities.Pics
{
    public class PicData
    {
        public Guid Id { get; set; }
        public PicFormat Format { get; set; }
        [Required]
        public byte[] Data { get; set; }
    }
}

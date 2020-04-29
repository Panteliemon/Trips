﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class Picture
    {
        public int Id { get; set; }

        public int GalleryId { get; set; }
        public Gallery Gallery { get; set; }

        /// <summary>
        /// For ordering in the gallery
        /// </summary>
        public int Index { get; set; }

        // Keys for PicsDB. Some/all of them can be the same.
        public Guid SmallSizeId { get; set; }
        public Guid MediumSizeId { get; set; }
        public Guid LargeSizeId { get; set; }

        public DateTime? DateTaken { get; set; }
        public DateTime? DateUploaded { get; set; }
        public User UploadedBy { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
    }
}

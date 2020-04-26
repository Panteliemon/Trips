using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class Gallery
    {
        public int Id { get; set; }

        // Those 2 fields are managed only programmatically, DB has no idea what they mean.
        // For diagnostics purposes mainly.
        public GalleryOwner Owner { get; set; }
        public int OwnerId { get; set; }

        public ICollection<Picture> Pictures { get; set; }
    }
}

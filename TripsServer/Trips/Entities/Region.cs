using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class Region
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Picture TitlePicture { get; set; }
        public Gallery Gallery { get; set; }

        public User AddedBy { get; set; }
        public DateTime? AddedDate { get; set; }
        public User ChangedBy { get; set; }
        public DateTime? ChangedDate { get; set; }

        public ICollection<Place> Places { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class Place
    {
        public int Id { get; set; }
        public PlaceKind? Kind { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public Region Region { get; set; }
        public User AddedBy { get; set; }
        public DateTime? AddedDate { get; set; }
        public User ChangedBy { get; set; }
        public DateTime? ChangedDate { get; set; }

        public DateTime? DiscoveryDate { get; set; }
        public bool IsXBApproved { get; set; }

        public Picture TitlePicture { get; set; }
        public Gallery Gallery { get; set; }

        public ICollection<Visit> Visits { get; set; }
    }
}

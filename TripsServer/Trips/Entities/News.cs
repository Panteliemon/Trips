using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class News
    {
        public int Id { get; set; }
        public string UrlId { get; set; }
        public string Header { get; set; }
        public string Text { get; set; }

        public User PostedBy { get; set; }
        
        public DateTime? PostedDate { get; set; }
        public DateTime? EditedDate { get; set; }

        public Picture TitlePicture { get; set; }
        public Gallery Gallery { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public class Visit
    {
        public int Id { get; set; }
        public Trip Trip { get; set; }
        public Place Place { get; set; }             
        public Gallery Gallery { get; set; }

        public bool WithKebab { get; set; }
        public bool WithNightStay { get; set; }
    }
}

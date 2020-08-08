using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    public class PlacesStatsDto
    {
        /// <summary>
        /// Elements correspond to "places". The first (0th) element is first place, and so on.
        /// </summary>
        public List<PlacesMetricDto<int>> MostVisited { get; set; }
        /// <summary>
        /// Elements correspond to "places". The first (0th) element is first place, and so on.
        /// </summary>
        public List<PlacesMetricDto<int>> MostNightStay { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    /// <summary>
    /// Group of places, which share the same metric
    /// </summary>
    public class PlacesMetricDto<T>
    {
        public List<PlaceHeaderDto> Places { get; set; }
        public T Metric { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Entities
{
    public enum PlacePopularity
    {
        AlwaysFree = 1,
        SometimesOccupied = 2,
        MostProbablyOccupied = 3,
        Crowded = 4
    }
}

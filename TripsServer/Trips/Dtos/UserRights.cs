using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    [Flags]
    public enum UserRights
    {
        Admin = 1,
        EditNews = 2,
        EditTrips = 4,
        EditGeography = 8
    }
}

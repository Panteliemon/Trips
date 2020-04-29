using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    // There is no automapping for this DTO
    public class VisitForPlaceDto
    {
        public int TripId { get; set; }
        public DateTime? TripDate { get; set; }
        public List<UserHeaderDto> Participants { get; set; }
    }
}

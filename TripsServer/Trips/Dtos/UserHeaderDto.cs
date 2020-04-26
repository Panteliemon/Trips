using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    /// <summary>
    /// This DTO is intended for unauthorized requests (accessible to anyone),
    /// and also for minimizing traffic.
    /// </summary>
    public class UserHeaderDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Guid? ProfilePicture { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

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
        public Guid? SmallSizeProfilePicture { get; set; }
        public PicFormat? ProfilePictureFormat { get; set; }
    }
}

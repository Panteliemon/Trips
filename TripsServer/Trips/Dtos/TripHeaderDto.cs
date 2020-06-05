using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class TripHeaderDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime? Date { get; set; }
        public Guid? TitlePictureSmallSizeId { get; set; }
        public PicFormat? TitlePictureFormat { get; set; }

        public List<UserHeaderDto> Participants { get; set; }
    }
}

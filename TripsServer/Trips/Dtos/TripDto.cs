﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    public class TripDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? Date { get; set; }
        public PictureDto TitlePicture { get; set; }
        public GalleryDto Gallery { get; set; }

        public List<UserHeaderDto> Participants { get; set; }
        // TODO Vehicles
        public List<VisitDto> Visits { get; set; }
    }
}

﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    public class PlaceDto
    {
        public int Id { get; set; }
        public PlaceKind? Kind { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public UserHeaderDto AddedBy { get; set; }
        public DateTime? AddedDate { get; set; }
        public UserHeaderDto ChangedBy { get; set; }
        public DateTime? ChangedDate { get; set; }

        public DateTime? DiscoveryDate { get; set; }
        public PlaceAccessibility? Accessibility { get; set; }
        public PlaceAccessibility? NearestAccessibility { get; set; }
        public PlacePopularity? Popularity { get; set; }
        public PlaceCapacity? Capacity { get; set; }
        public bool IsXBApproved { get; set; }

        public Guid? TitlePictureSmallSizeId { get; set; }
        public GalleryDto Gallery { get; set; }
    }
}

﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Dtos
{
    /// <summary>
    /// This DTO is intended for authorized requests
    /// </summary>
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime? RegisteredDate { get; set; }
        public DateTime? LastChangedName { get; set; }
        public Guid? ProfilePicture { get; set; }
        public Guid? SmallSizeProfilePicture { get; set; }
        public PicFormat? ProfilePictureFormat { get; set; }

        public bool IsAdmin { get; set; }
        public bool CanPublishNews { get; set; }
        public bool CanPublishTrips { get; set; }
        public bool CanEditGeography { get; set; }
        public bool IsGuest { get; set; }
    }
}

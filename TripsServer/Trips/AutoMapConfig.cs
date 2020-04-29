using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Trips.Entities;
using Trips.Dtos;

namespace Trips
{
    public class AutoMapConfig : Profile
    {
        public AutoMapConfig()
        {
            CreateMap<User, UserDto>();
            CreateMap<User, UserHeaderDto>();

            CreateMap<Picture, PictureDto>();
            CreateMap<Gallery, GalleryDto>();

            CreateMap<Place, PlaceDto>();
            CreateMap<Place, PlaceHeaderDto>();
        }
    }
}

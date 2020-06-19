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

            CreateMap<Vehicle, VehicleDto>();
            CreateMap<Vehicle, VehicleHeaderDto>();

            CreateMap<Visit, VisitDto>();
            CreateMap<Trip, TripDto>().ForMember(
                dest => dest.Participants, opt => opt.MapFrom(trip => trip.Participants.Select(utt => utt.User))
            ).ForMember(
                dest => dest.Vehicles, opt => opt.MapFrom(trip => trip.Vehicles.Select(vtt => vtt.Vehicle))
            );
            CreateMap<Trip, TripHeaderDto>().ForMember(
                dest => dest.Participants, opt => opt.MapFrom(trip => trip.Participants.Select(utt => utt.User))
            );
        }
    }
}

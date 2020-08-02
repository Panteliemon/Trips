using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Trips.Dtos;
using Trips.Entities;
using Trips.Utils;
using AutoMapper;

namespace Trips.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private TripsContext _dataContext;
        private IMapper _mapper;

        public AuthController(TripsContext dataContext, IMapper mapper)
        {
            _dataContext = dataContext;
            _mapper = mapper;
        }

        [HttpPost]
        [Route("/authenticate")]
        public AuthenticationResponseDto Authenticate([FromForm] string userName, [FromForm] string password)
        {
            string lowerName = userName.ToLower();
            User user = _dataContext.Users.FirstOrDefault(u => u.Name.ToLower() == lowerName);
            if (user != null)
            {
                if (user.HashedPassword == Encryption.GetHashedPassword(password))
                { 
                    AuthenticationResponseDto result = new AuthenticationResponseDto();
                    result.User = _mapper.Map<UserDto>(user);
                    var tokenResult = Encryption.GetAuthenticationToken(result.User);
                    result.Token = tokenResult.Token;
                    result.Expires = tokenResult.Expires;

                    return result;
                }
                else
                {
                    Response.StatusCode = StatusCodes.Status400BadRequest;
                    return null;
                }
            }
            else
            {
                // If no "Bn" user (predefined admin) - then create.
                // This is entry point for blank DB.
                if (lowerName == "bn")
                {
                    User bn = new User();
                    bn.Name = "Bn";
                    bn.HashedPassword = Encryption.PredefinedHashedPassword;
                    bn.RegisteredDate = DateTime.Now;
                    bn.IsAdmin = true;
                    _dataContext.Users.Add(bn);
                    _dataContext.SaveChanges();
                }

                Response.StatusCode = StatusCodes.Status404NotFound;
                return null;
            }
        }
    }
}
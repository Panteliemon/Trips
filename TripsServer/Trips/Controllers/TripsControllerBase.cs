using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using Trips.Entities;
using Trips.Utils;

namespace Trips.Controllers
{
    public abstract class TripsControllerBase : ControllerBase
    {
        public TripsControllerBase(TripsContext dbContext, IMapper mapper)
        {
            DbContext = dbContext;
            Mapper = mapper;
        }

        protected TripsContext DbContext { get; private set; }

        protected IMapper Mapper { get; private set; }

        /// <summary>
        /// Gets current user from claimed identity from JWT.
        /// If there is no, or something wrong, then returns null.
        /// </summary>
        /// <returns></returns>
        protected User GetCurrentUser()
        {
            Claim uidClaim = ControllerContext.HttpContext.User?.Claims.FirstOrDefault(c => c.Type == Encryption.USER_ID_CLAIM);
            if (uidClaim != null)
            {
                if (int.TryParse(uidClaim.Value, out int userId))
                {
                    return DbContext.Users.FirstOrDefault(u => u.Id == userId);
                }
            }

            return null;
        }

        /// <summary>
        /// Async version. Gets current user from claimed identity from JWT.
        /// If there is no, or something wrong, then returns null.
        /// </summary>
        /// <returns></returns>
        protected async Task<User> GetCurrentUserAsync()
        {
            Claim uidClaim = ControllerContext.HttpContext.User?.Claims.FirstOrDefault(c => c.Type == Encryption.USER_ID_CLAIM);
            if (uidClaim != null)
            {
                if (int.TryParse(uidClaim.Value, out int userId))
                {
                    return await Task.Run(() => DbContext.Users.FirstOrDefault(u => u.Id == userId));
                }
            }

            return null;
        }
    }
}

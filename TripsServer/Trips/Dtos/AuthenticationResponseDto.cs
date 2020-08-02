using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Dtos
{
    public class AuthenticationResponseDto
    {
        public UserDto User { get; set; }
        public string Token { get; set; }
        public DateTime Expires { get; set; }
    }
}

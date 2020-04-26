using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Trips.Dtos;

namespace Trips.Utils
{
    public static class Encryption
    {
        public const string USER_ID_CLAIM = "uid";

        private static bool _configured = false;
        private static byte[] _saltForPasswords;
        private static byte[] _keyForTokens;
        private static JwtSecurityTokenHandler _tokenHandler;

        static Encryption()
        {
            _tokenHandler = new JwtSecurityTokenHandler();
        }

        public static string PredefinedHashedPassword { get; private set; }

        public static SymmetricSecurityKey AuthenticationTokenKey { get; private set; }

        public static void Configure(IConfiguration configuration)
        {
            if (_configured)
            {
                throw new InvalidOperationException("Already configured");
            }

            if ((configuration["Keys:TKN"] == null) || (configuration["Keys:PWH"] == null))
            {
                throw new InvalidOperationException("Keys not found (security.json)");
            }

            if (configuration["Keys:PBP"] == null)
            {
                throw new InvalidOperationException("Predefined password not set (security.json)");
            }

            _keyForTokens = Encoding.ASCII.GetBytes(configuration["Keys:TKN"]);
            _saltForPasswords = Encoding.ASCII.GetBytes(configuration["Keys:PWH"]);

            AuthenticationTokenKey = new SymmetricSecurityKey(_keyForTokens);
            PredefinedHashedPassword = GetHashedPassword(configuration["Keys:PBP"]);

            _configured = true;
        }

        public static string GetHashedPassword(string rawPassword)
        {
            if (_saltForPasswords == null)
            {
                throw new InvalidOperationException("Not initialized");
            }

            byte[] hash = KeyDerivation.Pbkdf2(rawPassword ?? string.Empty, _saltForPasswords, KeyDerivationPrf.HMACSHA1, 1488, 64);
            return Convert.ToBase64String(hash);
        }

        public static string GetAuthenticationToken(UserDto userDto)
        {
            if (_keyForTokens == null)
            {
                throw new InvalidOperationException("Not initialized");
            }

            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor();
            tokenDescriptor.Subject = new ClaimsIdentity();
            tokenDescriptor.Subject.AddClaim(new Claim(USER_ID_CLAIM, userDto.Id.ToString()));
            tokenDescriptor.Expires = DateTime.Now.Add(Program.TOKEN_EXPIRATION);
            tokenDescriptor.SigningCredentials = new SigningCredentials(AuthenticationTokenKey, SecurityAlgorithms.HmacSha256Signature);

            SecurityToken token = _tokenHandler.CreateToken(tokenDescriptor);
            return _tokenHandler.WriteToken(token);
        }
    }
}

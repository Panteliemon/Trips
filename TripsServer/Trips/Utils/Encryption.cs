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
using Trips.Config;
using Trips.Dtos;

namespace Trips.Utils
{
    public static class Encryption
    {
        public class AuthenticationTokenResult
        {
            public AuthenticationTokenResult(string token, DateTime expires)
            {
                Token = token;
                Expires = expires;
            }

            public string Token { get; }
            public DateTime Expires { get; }
        }

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

        public static void Configure(Keys keys)
        {
            if (_configured)
            {
                throw new InvalidOperationException("Already configured");
            }

            if ((keys.AuthTokensKey == null) || (keys.PasswordHashSeed == null))
            {
                throw new InvalidOperationException("Keys not found (keys.xml)");
            }

            if (keys.AppDefaultUserPassword == null)
            {
                throw new InvalidOperationException("Predefined password not set (keys.xml)");
            }

            _keyForTokens = Encoding.ASCII.GetBytes(keys.AuthTokensKey);
            _saltForPasswords = Encoding.ASCII.GetBytes(keys.PasswordHashSeed);

            AuthenticationTokenKey = new SymmetricSecurityKey(_keyForTokens);
            PredefinedHashedPassword = GetHashedPassword(keys.AppDefaultUserPassword);

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

        public static AuthenticationTokenResult GetAuthenticationToken(UserDto userDto)
        {
            if (_keyForTokens == null)
            {
                throw new InvalidOperationException("Not initialized");
            }

            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor();
            tokenDescriptor.Subject = new ClaimsIdentity();
            tokenDescriptor.Subject.AddClaim(new Claim(USER_ID_CLAIM, userDto.Id.ToString()));
            tokenDescriptor.Expires = DateTime.UtcNow.Add(Program.TOKEN_EXPIRATION);
            tokenDescriptor.SigningCredentials = new SigningCredentials(AuthenticationTokenKey, SecurityAlgorithms.HmacSha256Signature);

            SecurityToken token = _tokenHandler.CreateToken(tokenDescriptor);
            return new AuthenticationTokenResult(
                _tokenHandler.WriteToken(token),
                tokenDescriptor.Expires.Value.ToLocalTime()
            );
        }
    }
}

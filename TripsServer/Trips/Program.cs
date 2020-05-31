using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Trips.Config;
using Trips.PictureStorages;
using Trips.Utils;

namespace Trips
{
    public class Program
    {
        private static bool _appStarted;
        private static bool _configured;
        private static string _tripsConnectionString;
        private static string _picsConnectionString;

        public static string ClientUrl =>
#if DEBUG
            @"http://localhost:4200";
#else
            @"https://poezdo4ki.azurewebsites.net";
#endif

        /// <summary>
        /// This property disables all writing operations in the app. Change to true if needed and rebuild.
        /// </summary>
        public static bool IsLocked => false;

        public static IPictureStorage PictureStorage { get; private set; }

        // TODO edit dbconfig.xml to change the value
        public static string TripsConnectionString
        {
            get
            {
                if (!_configured)
                {
                    Configure();
                }

                return _tripsConnectionString;
            }
        }

        // TODO edit dbconfig.xml to change the value
        public static string PicsConnectionString
        {
            get
            {
                if (!_configured)
                {
                    Configure();
                }

                return _picsConnectionString;
            }
        }

        public static readonly TimeSpan USERNAME_CHANGE_INTERVAL = TimeSpan.FromDays(6);
        public static readonly TimeSpan TOKEN_EXPIRATION = TimeSpan.FromDays(6.7);

        public static void Main(string[] args)
        {
            // Create empty configs if first time / if lost
            //Config.DatabasesConfiguration.CreateExample();
            //Config.Keys.CreateExample();

            _appStarted = true;
            Configure();

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, config) =>
                {
                    // Attach additional configs here
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });

        private static void Configure()
        {
            DatabasesConfiguration dbConfig = DatabasesConfiguration.Load();
            Keys keys = Keys.Load();

#if DEBUG
#else
            // Override! 👺
            dbConfig.UseRemote = true;
#endif

            if (dbConfig.UseRemote)
            {
                if (_appStarted)
                {
                    // For app: use ordinary user
                    _tripsConnectionString = string.Format(dbConfig.RemoteTripsTemplate, "TripsUser", keys.TripsUserPassword);
                    _picsConnectionString = string.Format(dbConfig.RemotePicsTemplate, "TripsUser", keys.TripsUserPassword);
                }
                else
                {
                    // For EF update-database operation: use admin user
                    _tripsConnectionString = string.Format(dbConfig.RemoteTripsTemplate, "TripsAdmin", keys.TripsAdminPassword);
                    _picsConnectionString = string.Format(dbConfig.RemotePicsTemplate, "TripsAdmin", keys.TripsAdminPassword);
                }
            }
            else
            {
                _tripsConnectionString = string.Format(dbConfig.LocalTripsTemplate, dbConfig.LocalServerName, dbConfig.LocalTripsPath);
                _picsConnectionString = string.Format(dbConfig.LocalPicsTemplate, dbConfig.LocalServerName, dbConfig.LocalPicsPath);
            }

            Encryption.Configure(keys);

            if (dbConfig.UseRemote)
            {
                PictureStorage = new AmazonS3PictureStorage(keys);
            }
            else
            {
                PictureStorage = new LocalFSPictureStorage(dbConfig.PicsStorageFolder);
            }

            _configured = true;
        }
    }
}

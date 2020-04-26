using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Trips.Utils;

namespace Trips
{
    public class Program
    {
        public static string ClientUrl => @"http://localhost:4200";

        public static string TripsConnectionString =>
            $"Data Source={LOCAL_SERVER_NAME};AttachDbFilename=\"{TRIPS_LOCAL_DB_FILE}\";Initial Catalog=TripsDB;Integrated Security=True";

        public static string PicsConnectionString =>
            $"Data Source={LOCAL_SERVER_NAME};AttachDbFilename=\"{PICS_LOCAL_DB_FILE}\";Initial Catalog=PicsDB;Integrated Security=True";

        public static readonly TimeSpan USERNAME_CHANGE_INTERVAL = TimeSpan.FromDays(6);
        public static readonly TimeSpan TOKEN_EXPIRATION = TimeSpan.FromDays(6.7);

        private const string LOCAL_SERVER_NAME = @"(localdb)\MSSQLLocalDB";
        private const string TRIPS_LOCAL_DB_FILE = @"E:\Игорь\Trips\TripsServer\Database\TripsDB.mdf";
        private const string PICS_LOCAL_DB_FILE = @"E:\Игорь\Trips\TripsServer\Database\PicsDB.mdf";

        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, config) =>
                {
                    config.AddJsonFile("security.json", optional: false, reloadOnChange: true);
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });

        public static void Configure(IConfiguration configuration)
        {
            Encryption.Configure(configuration);
        }
    }
}

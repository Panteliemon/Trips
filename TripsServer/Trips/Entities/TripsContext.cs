using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Trips.Entities
{
    // -context Trips.Entities.TripsContext
    public class TripsContext : DbContext
    {
        #region Queries Logging

        class PrimitiveLoggingProvider : ILoggerProvider
        {
            public ILogger CreateLogger(string categoryName)
            {
                return new PrimitiveLogger();
            }

            public void Dispose()
            {
            }
        }

        class PrimitiveLogger : ILogger
        {
            public IDisposable BeginScope<TState>(TState state)
            {
                throw new NotImplementedException();
            }

            public bool IsEnabled(LogLevel logLevel)
            {
                return true;
            }

            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
            {
                string s = state.ToString();
                if (s.StartsWith("Executed DbCommand")
                    || (s.StartsWith("Failed"))
                    || (s.StartsWith("An exception occurred")))
                {
                    System.Diagnostics.Debug.WriteLine(state);
                }
            }
        }

        private static readonly ILoggerFactory _lf = new LoggerFactory(new[] { new PrimitiveLoggingProvider() });

        #endregion

        public TripsContext(DbContextOptions<TripsContext> options)
            : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(Program.TripsConnectionString);
#if DEBUG
            optionsBuilder.UseLoggerFactory(_lf);
#endif
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Users to Trips many-to-many
            modelBuilder.Entity<UsersToTrips>().HasKey(utt => new { utt.TripId, utt.UserId });
            modelBuilder.Entity<UsersToTrips>().HasOne(utt => utt.User)
                .WithMany(u => u.Trips).HasForeignKey(utt2 => utt2.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<UsersToTrips>().HasOne(utt => utt.Trip)
                .WithMany(t => t.Participants).HasForeignKey(utt2 => utt2.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            // Vehicles to Trips many-to-many
            modelBuilder.Entity<VehiclesToTrips>().HasKey(vtt => new { vtt.TripId, vtt.VehicleId });
            modelBuilder.Entity<VehiclesToTrips>().HasOne(vtt => vtt.Vehicle)
                .WithMany(v => v.Trips).HasForeignKey(vtt2 => vtt2.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<VehiclesToTrips>().HasOne(vtt => vtt.Trip)
                .WithMany(t => t.Vehicles).HasForeignKey(vtt2 => vtt2.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            // Added by / Changed by ambiguity
            modelBuilder.Entity<News>().HasOne(n => n.PostedBy).WithMany(u => u.PostedNews);
            modelBuilder.Entity<News>().HasOne(n => n.EditedBy).WithMany(u => u.EditedNews);
            modelBuilder.Entity<Place>().HasOne(p => p.AddedBy).WithMany(u => u.AddedPlaces);
            modelBuilder.Entity<Place>().HasOne(p => p.ChangedBy).WithMany(u => u.ChangedPlaces);
            modelBuilder.Entity<Region>().HasOne(r => r.AddedBy).WithMany(u => u.AddedRegions);
            modelBuilder.Entity<Region>().HasOne(r => r.ChangedBy).WithMany(u => u.ChangedRegions);
            modelBuilder.Entity<Trip>().HasOne(t => t.AddedBy).WithMany(u => u.AddedTrips);
            modelBuilder.Entity<Trip>().HasOne(t => t.ChangedBy).WithMany(u => u.ChangedTrips);
            modelBuilder.Entity<Vehicle>().HasOne(v => v.AddedBy).WithMany(u => u.AddedVehicles);
            modelBuilder.Entity<Vehicle>().HasOne(v => v.ChangedBy).WithMany(u => u.ChangedVehicles);

            // Picture-Gallery: unobvious index
            modelBuilder.Entity<Picture>().HasOne(p => p.Gallery).WithMany(g => g.Pictures)
                .HasForeignKey(p => p.GalleryId).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Picture>().HasIndex(p => new { p.GalleryId, p.Index });

            // Title picture delete restriction
            modelBuilder.Entity<News>().HasOne(n => n.TitlePicture).WithMany().OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Place>().HasOne(p => p.TitlePicture).WithMany().OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Region>().HasOne(r => r.TitlePicture).WithMany().OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Trip>().HasOne(t => t.TitlePicture).WithMany().OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Vehicle>().HasOne(v => v.TitlePicture).WithMany().OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Visit>().HasOne(v => v.Place).WithMany(p => p.Visits).OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Picture>().HasOne(p => p.UploadedBy).WithMany(u => u.UploadedPics).OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Vehicle>().HasOne(v => v.Owner).WithMany(u => u.Vehicles).OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ServiceOperationHistory>().HasIndex(h => new { h.Key, h.Ended });
        }

        public DbSet<Place> Places { get; set; }
        public DbSet<Region> Regions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Visit> Visits { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<Gallery> Galleries { get; set; }
        public DbSet<Picture> Pictures { get; set; }
        public DbSet<ServiceOperationHistory> ServiceOperationsHistory { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Trips.Entities
{
    // -context Trips.Entities.TripsContext
    public class TripsContext : DbContext
    {
        public TripsContext(DbContextOptions<TripsContext> options)
            : base(options)
        {
        }

        //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //{
        //    optionsBuilder.UseSqlServer(Program.TripsConnectionString);
        //}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Users to Trips many-to-many
            modelBuilder.Entity<UsersToTrips>().HasKey(utt => new { utt.TripId, utt.UserId });
            modelBuilder.Entity<UsersToTrips>().HasOne(utt => utt.User)
                .WithMany(u => u.Trips).HasForeignKey(utt2 => utt2.UserId);
            modelBuilder.Entity<UsersToTrips>().HasOne(utt => utt.Trip)
                .WithMany(t => t.Users).HasForeignKey(utt2 => utt2.TripId);

            // Vehicles to Trips many-to-many
            modelBuilder.Entity<VehiclesToTrips>().HasKey(vtt => new { vtt.TripId, vtt.VehicleId });
            modelBuilder.Entity<VehiclesToTrips>().HasOne(vtt => vtt.Vehicle)
                .WithMany(v => v.Trips).HasForeignKey(vtt2 => vtt2.VehicleId);
            modelBuilder.Entity<VehiclesToTrips>().HasOne(vtt => vtt.Trip)
                .WithMany(t => t.Vehicles).HasForeignKey(vtt2 => vtt2.TripId);

            // Added by / Changed by ambiguity
            modelBuilder.Entity<Place>().HasOne(p => p.AddedBy).WithMany(u => u.AddedPlaces);
            modelBuilder.Entity<Place>().HasOne(p => p.ChangedBy).WithMany(u => u.ChangedPlaces);
            modelBuilder.Entity<Region>().HasOne(r => r.AddedBy).WithMany(u => u.AddedRegions);
            modelBuilder.Entity<Region>().HasOne(r => r.ChangedBy).WithMany(u => u.ChangedRegions);

            // Picture-Gallery: unobvious index
            modelBuilder.Entity<Picture>().HasOne(p => p.Gallery).WithMany(g => g.Pictures)
                .HasForeignKey(p => p.GalleryId).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Picture>().HasIndex(p => new { p.GalleryId, p.Index });
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
    }
}

﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Trips.Entities;

namespace Trips.Migrations
{
    [DbContext(typeof(TripsContext))]
    partial class TripsContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Trips.Entities.Gallery", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("Owner")
                        .HasColumnType("int");

                    b.Property<int>("OwnerId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Galleries");
                });

            modelBuilder.Entity("Trips.Entities.News", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime?>("EditedDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("GalleryId")
                        .HasColumnType("int");

                    b.Property<string>("Header")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("PostedById")
                        .HasColumnType("int");

                    b.Property<DateTime?>("PostedDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Text")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("TitlePictureId")
                        .HasColumnType("int");

                    b.Property<string>("UrlId")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("GalleryId");

                    b.HasIndex("PostedById");

                    b.HasIndex("TitlePictureId");

                    b.ToTable("News");
                });

            modelBuilder.Entity("Trips.Entities.Picture", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime?>("DateTaken")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DateUploaded")
                        .HasColumnType("datetime2");

                    b.Property<int>("GalleryId")
                        .HasColumnType("int");

                    b.Property<int>("Height")
                        .HasColumnType("int");

                    b.Property<int>("Index")
                        .HasColumnType("int");

                    b.Property<Guid>("LargeSizeId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("MediumSizeId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("SmallSizeId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int?>("UploadedById")
                        .HasColumnType("int");

                    b.Property<int>("Width")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UploadedById");

                    b.HasIndex("GalleryId", "Index");

                    b.ToTable("Pictures");
                });

            modelBuilder.Entity("Trips.Entities.Place", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("Accessibility")
                        .HasColumnType("int");

                    b.Property<int?>("AddedById")
                        .HasColumnType("int");

                    b.Property<DateTime?>("AddedDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("Capacity")
                        .HasColumnType("int");

                    b.Property<int?>("ChangedById")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ChangedDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime?>("DiscoveryDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("GalleryId")
                        .HasColumnType("int");

                    b.Property<bool>("IsXBApproved")
                        .HasColumnType("bit");

                    b.Property<int?>("Kind")
                        .HasColumnType("int");

                    b.Property<string>("Location")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("NearestAccessibility")
                        .HasColumnType("int");

                    b.Property<int?>("Popularity")
                        .HasColumnType("int");

                    b.Property<int?>("RegionId")
                        .HasColumnType("int");

                    b.Property<int?>("TitlePictureId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("AddedById");

                    b.HasIndex("ChangedById");

                    b.HasIndex("GalleryId");

                    b.HasIndex("RegionId");

                    b.HasIndex("TitlePictureId");

                    b.ToTable("Places");
                });

            modelBuilder.Entity("Trips.Entities.Region", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("AddedById")
                        .HasColumnType("int");

                    b.Property<DateTime?>("AddedDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("ChangedById")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ChangedDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("AddedById");

                    b.HasIndex("ChangedById");

                    b.ToTable("Regions");
                });

            modelBuilder.Entity("Trips.Entities.Trip", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime?>("Date")
                        .HasColumnType("datetime2");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("GalleryId")
                        .HasColumnType("int");

                    b.Property<string>("Title")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("GalleryId");

                    b.ToTable("Trips");
                });

            modelBuilder.Entity("Trips.Entities.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<bool>("CanEditGeography")
                        .HasColumnType("bit");

                    b.Property<bool>("CanPublishNews")
                        .HasColumnType("bit");

                    b.Property<bool>("CanPublishTrips")
                        .HasColumnType("bit");

                    b.Property<string>("HashedPassword")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IsAdmin")
                        .HasColumnType("bit");

                    b.Property<DateTime?>("LastChangedName")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid?>("ProfilePicture")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime?>("RegisteredDate")
                        .HasColumnType("datetime2");

                    b.Property<Guid?>("SmallSizeProfilePicture")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Trips.Entities.UsersToTrips", b =>
                {
                    b.Property<int>("TripId")
                        .HasColumnType("int");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("TripId", "UserId");

                    b.HasIndex("UserId");

                    b.ToTable("UsersToTrips");
                });

            modelBuilder.Entity("Trips.Entities.Vehicle", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("AcceptableAccessibility")
                        .HasColumnType("int");

                    b.Property<int?>("GalleryId")
                        .HasColumnType("int");

                    b.Property<string>("LicenseNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("OfficialName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("OwnerId")
                        .HasColumnType("int");

                    b.Property<int?>("YearOfManufacture")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("GalleryId");

                    b.HasIndex("OwnerId");

                    b.ToTable("Vehicles");
                });

            modelBuilder.Entity("Trips.Entities.VehiclesToTrips", b =>
                {
                    b.Property<int>("TripId")
                        .HasColumnType("int");

                    b.Property<int>("VehicleId")
                        .HasColumnType("int");

                    b.HasKey("TripId", "VehicleId");

                    b.HasIndex("VehicleId");

                    b.ToTable("VehiclesToTrips");
                });

            modelBuilder.Entity("Trips.Entities.Visit", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("GalleryId")
                        .HasColumnType("int");

                    b.Property<int?>("PlaceId")
                        .HasColumnType("int");

                    b.Property<int?>("TripId")
                        .HasColumnType("int");

                    b.Property<bool>("WithKebab")
                        .HasColumnType("bit");

                    b.Property<bool>("WithNightStay")
                        .HasColumnType("bit");

                    b.HasKey("Id");

                    b.HasIndex("GalleryId");

                    b.HasIndex("PlaceId");

                    b.HasIndex("TripId");

                    b.ToTable("Visits");
                });

            modelBuilder.Entity("Trips.Entities.News", b =>
                {
                    b.HasOne("Trips.Entities.Gallery", "Gallery")
                        .WithMany()
                        .HasForeignKey("GalleryId");

                    b.HasOne("Trips.Entities.User", "PostedBy")
                        .WithMany("PostedNews")
                        .HasForeignKey("PostedById");

                    b.HasOne("Trips.Entities.Picture", "TitlePicture")
                        .WithMany()
                        .HasForeignKey("TitlePictureId");
                });

            modelBuilder.Entity("Trips.Entities.Picture", b =>
                {
                    b.HasOne("Trips.Entities.Gallery", "Gallery")
                        .WithMany("Pictures")
                        .HasForeignKey("GalleryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Trips.Entities.User", "UploadedBy")
                        .WithMany("UploadedPics")
                        .HasForeignKey("UploadedById");
                });

            modelBuilder.Entity("Trips.Entities.Place", b =>
                {
                    b.HasOne("Trips.Entities.User", "AddedBy")
                        .WithMany("AddedPlaces")
                        .HasForeignKey("AddedById");

                    b.HasOne("Trips.Entities.User", "ChangedBy")
                        .WithMany("ChangedPlaces")
                        .HasForeignKey("ChangedById");

                    b.HasOne("Trips.Entities.Gallery", "Gallery")
                        .WithMany()
                        .HasForeignKey("GalleryId");

                    b.HasOne("Trips.Entities.Region", "Region")
                        .WithMany("Places")
                        .HasForeignKey("RegionId");

                    b.HasOne("Trips.Entities.Picture", "TitlePicture")
                        .WithMany()
                        .HasForeignKey("TitlePictureId");
                });

            modelBuilder.Entity("Trips.Entities.Region", b =>
                {
                    b.HasOne("Trips.Entities.User", "AddedBy")
                        .WithMany("AddedRegions")
                        .HasForeignKey("AddedById");

                    b.HasOne("Trips.Entities.User", "ChangedBy")
                        .WithMany("ChangedRegions")
                        .HasForeignKey("ChangedById");
                });

            modelBuilder.Entity("Trips.Entities.Trip", b =>
                {
                    b.HasOne("Trips.Entities.Gallery", "Gallery")
                        .WithMany()
                        .HasForeignKey("GalleryId");
                });

            modelBuilder.Entity("Trips.Entities.UsersToTrips", b =>
                {
                    b.HasOne("Trips.Entities.Trip", "Trip")
                        .WithMany("Users")
                        .HasForeignKey("TripId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Trips.Entities.User", "User")
                        .WithMany("Trips")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Trips.Entities.Vehicle", b =>
                {
                    b.HasOne("Trips.Entities.Gallery", "Gallery")
                        .WithMany()
                        .HasForeignKey("GalleryId");

                    b.HasOne("Trips.Entities.User", "Owner")
                        .WithMany("Vehicles")
                        .HasForeignKey("OwnerId");
                });

            modelBuilder.Entity("Trips.Entities.VehiclesToTrips", b =>
                {
                    b.HasOne("Trips.Entities.Trip", "Trip")
                        .WithMany("Vehicles")
                        .HasForeignKey("TripId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Trips.Entities.Vehicle", "Vehicle")
                        .WithMany("Trips")
                        .HasForeignKey("VehicleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Trips.Entities.Visit", b =>
                {
                    b.HasOne("Trips.Entities.Gallery", "Gallery")
                        .WithMany()
                        .HasForeignKey("GalleryId");

                    b.HasOne("Trips.Entities.Place", "Place")
                        .WithMany("Visits")
                        .HasForeignKey("PlaceId");

                    b.HasOne("Trips.Entities.Trip", "Trip")
                        .WithMany("Visits")
                        .HasForeignKey("TripId");
                });
#pragma warning restore 612, 618
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class TripsDbInitial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Galleries",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Owner = table.Column<int>(nullable: false),
                    OwnerId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Galleries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<int>(nullable: false),
                    HashedPassword = table.Column<string>(nullable: true),
                    RegisteredDate = table.Column<DateTime>(nullable: true),
                    ProfilePicture = table.Column<Guid>(nullable: true),
                    IsAdmin = table.Column<bool>(nullable: false),
                    CanPublishNews = table.Column<bool>(nullable: false),
                    CanPublishTrips = table.Column<bool>(nullable: false),
                    CanEditGeography = table.Column<bool>(nullable: false),
                    CanInviteUsers = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Trips",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(nullable: true),
                    GalleryId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trips_Galleries_GalleryId",
                        column: x => x.GalleryId,
                        principalTable: "Galleries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GalleryItems",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GalleryId = table.Column<int>(nullable: false),
                    Index = table.Column<int>(nullable: false),
                    PictureId = table.Column<Guid>(nullable: false),
                    DateTaken = table.Column<DateTime>(nullable: true),
                    DateUploaded = table.Column<DateTime>(nullable: true),
                    UploadedById = table.Column<int>(nullable: true),
                    Height = table.Column<int>(nullable: false),
                    Width = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GalleryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GalleryItems_Galleries_GalleryId",
                        column: x => x.GalleryId,
                        principalTable: "Galleries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GalleryItems_Users_UploadedById",
                        column: x => x.UploadedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Regions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(nullable: true),
                    AddedById = table.Column<int>(nullable: true),
                    AddedDate = table.Column<DateTime>(nullable: true),
                    ChangedById = table.Column<int>(nullable: true),
                    ChangedDate = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Regions_Users_AddedById",
                        column: x => x.AddedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Regions_Users_ChangedById",
                        column: x => x.ChangedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerId = table.Column<int>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    OfficialName = table.Column<string>(nullable: true),
                    LicenseNumber = table.Column<string>(nullable: true),
                    YearOfManufacture = table.Column<int>(nullable: true),
                    GalleryId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vehicles_Galleries_GalleryId",
                        column: x => x.GalleryId,
                        principalTable: "Galleries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vehicles_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UsersToTrips",
                columns: table => new
                {
                    UserId = table.Column<int>(nullable: false),
                    TripId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsersToTrips", x => new { x.TripId, x.UserId });
                    table.ForeignKey(
                        name: "FK_UsersToTrips_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsersToTrips_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "News",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UrlId = table.Column<string>(nullable: true),
                    Header = table.Column<string>(nullable: true),
                    Text = table.Column<string>(nullable: true),
                    PostedById = table.Column<int>(nullable: true),
                    PostedDate = table.Column<DateTime>(nullable: true),
                    EditedDate = table.Column<DateTime>(nullable: true),
                    TitlePictureId = table.Column<int>(nullable: true),
                    GalleryId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_News", x => x.Id);
                    table.ForeignKey(
                        name: "FK_News_Galleries_GalleryId",
                        column: x => x.GalleryId,
                        principalTable: "Galleries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_News_Users_PostedById",
                        column: x => x.PostedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_News_GalleryItems_TitlePictureId",
                        column: x => x.TitlePictureId,
                        principalTable: "GalleryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Places",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Kind = table.Column<int>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    Location = table.Column<string>(nullable: true),
                    RegionId = table.Column<int>(nullable: true),
                    AddedById = table.Column<int>(nullable: true),
                    AddedDate = table.Column<DateTime>(nullable: true),
                    ChangedById = table.Column<int>(nullable: true),
                    ChangedDate = table.Column<DateTime>(nullable: true),
                    DiscoveryDate = table.Column<DateTime>(nullable: true),
                    IsXBApproved = table.Column<bool>(nullable: false),
                    TitlePictureId = table.Column<int>(nullable: true),
                    GalleryId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Places", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Places_Users_AddedById",
                        column: x => x.AddedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Places_Users_ChangedById",
                        column: x => x.ChangedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Places_Galleries_GalleryId",
                        column: x => x.GalleryId,
                        principalTable: "Galleries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Places_Regions_RegionId",
                        column: x => x.RegionId,
                        principalTable: "Regions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Places_GalleryItems_TitlePictureId",
                        column: x => x.TitlePictureId,
                        principalTable: "GalleryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VehiclesToTrips",
                columns: table => new
                {
                    VehicleId = table.Column<int>(nullable: false),
                    TripId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehiclesToTrips", x => new { x.TripId, x.VehicleId });
                    table.ForeignKey(
                        name: "FK_VehiclesToTrips_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VehiclesToTrips_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Visits",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TripId = table.Column<int>(nullable: true),
                    PlaceId = table.Column<int>(nullable: true),
                    GalleryId = table.Column<int>(nullable: true),
                    WithKebab = table.Column<bool>(nullable: false),
                    WithNightStay = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Visits_Galleries_GalleryId",
                        column: x => x.GalleryId,
                        principalTable: "Galleries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Visits_Places_PlaceId",
                        column: x => x.PlaceId,
                        principalTable: "Places",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Visits_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GalleryItems_UploadedById",
                table: "GalleryItems",
                column: "UploadedById");

            migrationBuilder.CreateIndex(
                name: "IX_GalleryItems_GalleryId_Index",
                table: "GalleryItems",
                columns: new[] { "GalleryId", "Index" });

            migrationBuilder.CreateIndex(
                name: "IX_News_GalleryId",
                table: "News",
                column: "GalleryId");

            migrationBuilder.CreateIndex(
                name: "IX_News_PostedById",
                table: "News",
                column: "PostedById");

            migrationBuilder.CreateIndex(
                name: "IX_News_TitlePictureId",
                table: "News",
                column: "TitlePictureId");

            migrationBuilder.CreateIndex(
                name: "IX_Places_AddedById",
                table: "Places",
                column: "AddedById");

            migrationBuilder.CreateIndex(
                name: "IX_Places_ChangedById",
                table: "Places",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_Places_GalleryId",
                table: "Places",
                column: "GalleryId");

            migrationBuilder.CreateIndex(
                name: "IX_Places_RegionId",
                table: "Places",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Places_TitlePictureId",
                table: "Places",
                column: "TitlePictureId");

            migrationBuilder.CreateIndex(
                name: "IX_Regions_AddedById",
                table: "Regions",
                column: "AddedById");

            migrationBuilder.CreateIndex(
                name: "IX_Regions_ChangedById",
                table: "Regions",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_GalleryId",
                table: "Trips",
                column: "GalleryId");

            migrationBuilder.CreateIndex(
                name: "IX_UsersToTrips_UserId",
                table: "UsersToTrips",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_GalleryId",
                table: "Vehicles",
                column: "GalleryId");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_OwnerId",
                table: "Vehicles",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_VehiclesToTrips_VehicleId",
                table: "VehiclesToTrips",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_GalleryId",
                table: "Visits",
                column: "GalleryId");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_PlaceId",
                table: "Visits",
                column: "PlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_TripId",
                table: "Visits",
                column: "TripId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "News");

            migrationBuilder.DropTable(
                name: "UsersToTrips");

            migrationBuilder.DropTable(
                name: "VehiclesToTrips");

            migrationBuilder.DropTable(
                name: "Visits");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "Places");

            migrationBuilder.DropTable(
                name: "Trips");

            migrationBuilder.DropTable(
                name: "Regions");

            migrationBuilder.DropTable(
                name: "GalleryItems");

            migrationBuilder.DropTable(
                name: "Galleries");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}

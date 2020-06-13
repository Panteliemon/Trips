using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class ManyToManyIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Index",
                table: "Visits",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Index",
                table: "VehiclesToTrips",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Index",
                table: "UsersToTrips",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Index",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "Index",
                table: "VehiclesToTrips");

            migrationBuilder.DropColumn(
                name: "Index",
                table: "UsersToTrips");
        }
    }
}

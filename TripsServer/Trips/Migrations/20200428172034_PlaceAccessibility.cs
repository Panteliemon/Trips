using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class PlaceAccessibility : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AcceptableAccessibility",
                table: "Vehicles",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Accessibility",
                table: "Places",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NearestAccessibility",
                table: "Places",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Popularity",
                table: "Places",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcceptableAccessibility",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Accessibility",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "NearestAccessibility",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "Popularity",
                table: "Places");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class VisitPlaceNull : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Visits_Places_PlaceId",
                table: "Visits");

            migrationBuilder.AddForeignKey(
                name: "FK_Visits_Places_PlaceId",
                table: "Visits",
                column: "PlaceId",
                principalTable: "Places",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Visits_Places_PlaceId",
                table: "Visits");

            migrationBuilder.AddForeignKey(
                name: "FK_Visits_Places_PlaceId",
                table: "Visits",
                column: "PlaceId",
                principalTable: "Places",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

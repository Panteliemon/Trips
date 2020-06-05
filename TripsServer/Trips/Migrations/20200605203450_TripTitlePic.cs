using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class TripTitlePic : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TitlePictureId",
                table: "Trips",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trips_TitlePictureId",
                table: "Trips",
                column: "TitlePictureId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Pictures_TitlePictureId",
                table: "Trips",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Pictures_TitlePictureId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_TitlePictureId",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "TitlePictureId",
                table: "Trips");
        }
    }
}

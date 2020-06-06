using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class UoadeByFK : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pictures_Users_UploadedById",
                table: "Pictures");

            migrationBuilder.AddForeignKey(
                name: "FK_Pictures_Users_UploadedById",
                table: "Pictures",
                column: "UploadedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pictures_Users_UploadedById",
                table: "Pictures");

            migrationBuilder.AddForeignKey(
                name: "FK_Pictures_Users_UploadedById",
                table: "Pictures",
                column: "UploadedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

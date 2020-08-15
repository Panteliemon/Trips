using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class FriendlyUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsGuest",
                table: "Users",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UrlId",
                table: "Places",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UrlId",
                table: "News",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Places_UrlId",
                table: "Places",
                column: "UrlId");

            migrationBuilder.CreateIndex(
                name: "IX_News_UrlId",
                table: "News",
                column: "UrlId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Places_UrlId",
                table: "Places");

            migrationBuilder.DropIndex(
                name: "IX_News_UrlId",
                table: "News");

            migrationBuilder.DropColumn(
                name: "IsGuest",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UrlId",
                table: "Places");

            migrationBuilder.AlterColumn<string>(
                name: "UrlId",
                table: "News",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);
        }
    }
}

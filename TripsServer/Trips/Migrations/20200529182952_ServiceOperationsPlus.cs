using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class ServiceOperationsPlus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Vehicles",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProfilePictureFormat",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Pictures",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Format",
                table: "Pictures",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ServiceOperationsHistory",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(nullable: true),
                    Started = table.Column<DateTime>(nullable: false),
                    Ended = table.Column<DateTime>(nullable: false),
                    Result = table.Column<int>(nullable: false),
                    Output = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceOperationsHistory", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOperationsHistory_Key_Ended",
                table: "ServiceOperationsHistory",
                columns: new[] { "Key", "Ended" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceOperationsHistory");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "ProfilePictureFormat",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Pictures");

            migrationBuilder.DropColumn(
                name: "Format",
                table: "Pictures");
        }
    }
}

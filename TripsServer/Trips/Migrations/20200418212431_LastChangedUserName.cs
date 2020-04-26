using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class LastChangedUserName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastChangedName",
                table: "Users",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastChangedName",
                table: "Users");
        }
    }
}

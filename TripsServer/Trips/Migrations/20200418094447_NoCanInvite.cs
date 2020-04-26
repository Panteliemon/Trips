using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class NoCanInvite : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CanInviteUsers",
                table: "Users");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CanInviteUsers",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}

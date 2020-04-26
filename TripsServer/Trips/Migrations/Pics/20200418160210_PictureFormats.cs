using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations.Pics
{
    public partial class PictureFormats : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Format",
                table: "PicData",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Format",
                table: "PicData");
        }
    }
}

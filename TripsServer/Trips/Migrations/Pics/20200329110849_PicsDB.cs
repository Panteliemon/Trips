using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations.Pics
{
    /* REMOVED.
     * Picture storage, for the first 2 months of the project when pictures were stored in DB.
     * Commented code left for history.
    public partial class PicsDB : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PicData",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Data = table.Column<byte[]>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PicData", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PicData");
        }
    }*/
}

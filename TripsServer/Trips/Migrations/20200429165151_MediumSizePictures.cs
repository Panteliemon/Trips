using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class MediumSizePictures : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MiniatureId",
                table: "Pictures");

            migrationBuilder.DropColumn(
                name: "PictureId",
                table: "Pictures");

            migrationBuilder.AddColumn<Guid>(
                name: "LargeSizeId",
                table: "Pictures",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "MediumSizeId",
                table: "Pictures",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "SmallSizeId",
                table: "Pictures",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LargeSizeId",
                table: "Pictures");

            migrationBuilder.DropColumn(
                name: "MediumSizeId",
                table: "Pictures");

            migrationBuilder.DropColumn(
                name: "SmallSizeId",
                table: "Pictures");

            migrationBuilder.AddColumn<Guid>(
                name: "MiniatureId",
                table: "Pictures",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "PictureId",
                table: "Pictures",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }
    }
}

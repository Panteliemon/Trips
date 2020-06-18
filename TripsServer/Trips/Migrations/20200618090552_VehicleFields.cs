using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class VehicleFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Users_OwnerId",
                table: "Vehicles");

            migrationBuilder.AddColumn<int>(
                name: "AddedById",
                table: "Vehicles",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AddedDate",
                table: "Vehicles",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChangedById",
                table: "Vehicles",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ChangedDate",
                table: "Vehicles",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TitlePictureId",
                table: "Vehicles",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_AddedById",
                table: "Vehicles",
                column: "AddedById");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_ChangedById",
                table: "Vehicles",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_TitlePictureId",
                table: "Vehicles",
                column: "TitlePictureId");

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Users_AddedById",
                table: "Vehicles",
                column: "AddedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Users_ChangedById",
                table: "Vehicles",
                column: "ChangedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Users_OwnerId",
                table: "Vehicles",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Pictures_TitlePictureId",
                table: "Vehicles",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Users_AddedById",
                table: "Vehicles");

            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Users_ChangedById",
                table: "Vehicles");

            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Users_OwnerId",
                table: "Vehicles");

            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Pictures_TitlePictureId",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_AddedById",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_ChangedById",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_TitlePictureId",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "AddedById",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "AddedDate",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "ChangedById",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "ChangedDate",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "TitlePictureId",
                table: "Vehicles");

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Users_OwnerId",
                table: "Vehicles",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

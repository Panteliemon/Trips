using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class Consolidation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_News_Pictures_TitlePictureId",
                table: "News");

            migrationBuilder.DropForeignKey(
                name: "FK_Places_Pictures_TitlePictureId",
                table: "Places");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Pictures_TitlePictureId",
                table: "Trips");

            migrationBuilder.AddColumn<int>(
                name: "AddedById",
                table: "Trips",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AddedDate",
                table: "Trips",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChangedById",
                table: "Trips",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ChangedDate",
                table: "Trips",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Regions",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GalleryId",
                table: "Regions",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TitlePictureId",
                table: "Regions",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EditedById",
                table: "News",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trips_AddedById",
                table: "Trips",
                column: "AddedById");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_ChangedById",
                table: "Trips",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_Regions_GalleryId",
                table: "Regions",
                column: "GalleryId");

            migrationBuilder.CreateIndex(
                name: "IX_Regions_TitlePictureId",
                table: "Regions",
                column: "TitlePictureId");

            migrationBuilder.CreateIndex(
                name: "IX_News_EditedById",
                table: "News",
                column: "EditedById");

            migrationBuilder.AddForeignKey(
                name: "FK_News_Users_EditedById",
                table: "News",
                column: "EditedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_News_Pictures_TitlePictureId",
                table: "News",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Places_Pictures_TitlePictureId",
                table: "Places",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Regions_Galleries_GalleryId",
                table: "Regions",
                column: "GalleryId",
                principalTable: "Galleries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Regions_Pictures_TitlePictureId",
                table: "Regions",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Users_AddedById",
                table: "Trips",
                column: "AddedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Users_ChangedById",
                table: "Trips",
                column: "ChangedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Pictures_TitlePictureId",
                table: "Trips",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_News_Users_EditedById",
                table: "News");

            migrationBuilder.DropForeignKey(
                name: "FK_News_Pictures_TitlePictureId",
                table: "News");

            migrationBuilder.DropForeignKey(
                name: "FK_Places_Pictures_TitlePictureId",
                table: "Places");

            migrationBuilder.DropForeignKey(
                name: "FK_Regions_Galleries_GalleryId",
                table: "Regions");

            migrationBuilder.DropForeignKey(
                name: "FK_Regions_Pictures_TitlePictureId",
                table: "Regions");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Users_AddedById",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Users_ChangedById",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Pictures_TitlePictureId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_AddedById",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_ChangedById",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Regions_GalleryId",
                table: "Regions");

            migrationBuilder.DropIndex(
                name: "IX_Regions_TitlePictureId",
                table: "Regions");

            migrationBuilder.DropIndex(
                name: "IX_News_EditedById",
                table: "News");

            migrationBuilder.DropColumn(
                name: "AddedById",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "AddedDate",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "ChangedById",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "ChangedDate",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Regions");

            migrationBuilder.DropColumn(
                name: "GalleryId",
                table: "Regions");

            migrationBuilder.DropColumn(
                name: "TitlePictureId",
                table: "Regions");

            migrationBuilder.DropColumn(
                name: "EditedById",
                table: "News");

            migrationBuilder.AddForeignKey(
                name: "FK_News_Pictures_TitlePictureId",
                table: "News",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Places_Pictures_TitlePictureId",
                table: "Places",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Pictures_TitlePictureId",
                table: "Trips",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

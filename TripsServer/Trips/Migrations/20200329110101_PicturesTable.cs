using Microsoft.EntityFrameworkCore.Migrations;

namespace Trips.Migrations
{
    public partial class PicturesTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GalleryItems_Galleries_GalleryId",
                table: "GalleryItems");

            migrationBuilder.DropForeignKey(
                name: "FK_GalleryItems_Users_UploadedById",
                table: "GalleryItems");

            migrationBuilder.DropForeignKey(
                name: "FK_News_GalleryItems_TitlePictureId",
                table: "News");

            migrationBuilder.DropForeignKey(
                name: "FK_Places_GalleryItems_TitlePictureId",
                table: "Places");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GalleryItems",
                table: "GalleryItems");

            migrationBuilder.RenameTable(
                name: "GalleryItems",
                newName: "Pictures");

            migrationBuilder.RenameIndex(
                name: "IX_GalleryItems_GalleryId_Index",
                table: "Pictures",
                newName: "IX_Pictures_GalleryId_Index");

            migrationBuilder.RenameIndex(
                name: "IX_GalleryItems_UploadedById",
                table: "Pictures",
                newName: "IX_Pictures_UploadedById");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Pictures",
                table: "Pictures",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_News_Pictures_TitlePictureId",
                table: "News",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pictures_Galleries_GalleryId",
                table: "Pictures",
                column: "GalleryId",
                principalTable: "Galleries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pictures_Users_UploadedById",
                table: "Pictures",
                column: "UploadedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Places_Pictures_TitlePictureId",
                table: "Places",
                column: "TitlePictureId",
                principalTable: "Pictures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_News_Pictures_TitlePictureId",
                table: "News");

            migrationBuilder.DropForeignKey(
                name: "FK_Pictures_Galleries_GalleryId",
                table: "Pictures");

            migrationBuilder.DropForeignKey(
                name: "FK_Pictures_Users_UploadedById",
                table: "Pictures");

            migrationBuilder.DropForeignKey(
                name: "FK_Places_Pictures_TitlePictureId",
                table: "Places");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Pictures",
                table: "Pictures");

            migrationBuilder.RenameTable(
                name: "Pictures",
                newName: "GalleryItems");

            migrationBuilder.RenameIndex(
                name: "IX_Pictures_GalleryId_Index",
                table: "GalleryItems",
                newName: "IX_GalleryItems_GalleryId_Index");

            migrationBuilder.RenameIndex(
                name: "IX_Pictures_UploadedById",
                table: "GalleryItems",
                newName: "IX_GalleryItems_UploadedById");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GalleryItems",
                table: "GalleryItems",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GalleryItems_Galleries_GalleryId",
                table: "GalleryItems",
                column: "GalleryId",
                principalTable: "Galleries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GalleryItems_Users_UploadedById",
                table: "GalleryItems",
                column: "UploadedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_News_GalleryItems_TitlePictureId",
                table: "News",
                column: "TitlePictureId",
                principalTable: "GalleryItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Places_GalleryItems_TitlePictureId",
                table: "Places",
                column: "TitlePictureId",
                principalTable: "GalleryItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

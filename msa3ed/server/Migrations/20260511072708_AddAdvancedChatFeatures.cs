using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Uis.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvancedChatFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CustomOfferId",
                table: "Messages",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Chats",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CustomOffers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    DeliveryDays = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ExecutorId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomOffers_Users_ExecutorId",
                        column: x => x.ExecutorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomOffers_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_CustomOfferId",
                table: "Messages",
                column: "CustomOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomOffers_ExecutorId",
                table: "CustomOffers",
                column: "ExecutorId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomOffers_StudentId",
                table: "CustomOffers",
                column: "StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_CustomOffers_CustomOfferId",
                table: "Messages",
                column: "CustomOfferId",
                principalTable: "CustomOffers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_CustomOffers_CustomOfferId",
                table: "Messages");

            migrationBuilder.DropTable(
                name: "CustomOffers");

            migrationBuilder.DropIndex(
                name: "IX_Messages_CustomOfferId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "CustomOfferId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Chats");
        }
    }
}

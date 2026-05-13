using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Uis.Server.Migrations
{
    /// <inheritdoc />
    public partial class Feature013 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "TicketMessages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "VoiceDurationSeconds",
                table: "TicketMessages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int[]>(
                name: "WaveformData",
                table: "TicketMessages",
                type: "integer[]",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastEditedAt",
                table: "Services",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LastEditedByExecutorId",
                table: "Services",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SubCategoryId",
                table: "Services",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Messages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedByAdminId",
                table: "Messages",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Messages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Messages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "VoiceDurationSeconds",
                table: "Messages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationSeconds",
                table: "MessageAttachments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "MessageAttachments",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ChatReadReceipts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChatId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatReadReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatReadReceipts_Chats_ChatId",
                        column: x => x.ChatId,
                        principalTable: "Chats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChatReadReceipts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModerationActions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AdminId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    TargetMessageId = table.Column<Guid>(type: "uuid", nullable: true),
                    TargetUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    MuteExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModerationActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModerationActions_Messages_TargetMessageId",
                        column: x => x.TargetMessageId,
                        principalTable: "Messages",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ModerationActions_Users_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModerationActions_Users_TargetUserId",
                        column: x => x.TargetUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SubCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubCategories_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Services_SubCategoryId",
                table: "Services",
                column: "SubCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatReadReceipts_ChatId_UserId",
                table: "ChatReadReceipts",
                columns: new[] { "ChatId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChatReadReceipts_UserId",
                table: "ChatReadReceipts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationActions_AdminId",
                table: "ModerationActions",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationActions_TargetMessageId",
                table: "ModerationActions",
                column: "TargetMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationActions_TargetUserId",
                table: "ModerationActions",
                column: "TargetUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_CategoryId",
                table: "SubCategories",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_SubCategories_SubCategoryId",
                table: "Services",
                column: "SubCategoryId",
                principalTable: "SubCategories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_SubCategories_SubCategoryId",
                table: "Services");

            migrationBuilder.DropTable(
                name: "ChatReadReceipts");

            migrationBuilder.DropTable(
                name: "ModerationActions");

            migrationBuilder.DropTable(
                name: "SubCategories");

            migrationBuilder.DropIndex(
                name: "IX_Services_SubCategoryId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "TicketMessages");

            migrationBuilder.DropColumn(
                name: "VoiceDurationSeconds",
                table: "TicketMessages");

            migrationBuilder.DropColumn(
                name: "WaveformData",
                table: "TicketMessages");

            migrationBuilder.DropColumn(
                name: "LastEditedAt",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "LastEditedByExecutorId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "SubCategoryId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "DeletedByAdminId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "VoiceDurationSeconds",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "DurationSeconds",
                table: "MessageAttachments");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "MessageAttachments");
        }
    }
}

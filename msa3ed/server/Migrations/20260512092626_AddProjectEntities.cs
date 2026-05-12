using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Uis.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastActiveAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalWorkHours",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "ProjectOfferId",
                table: "Chats",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "GalleryItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExecutorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    MediaUrl = table.Column<string>(type: "text", nullable: false),
                    MediaType = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GalleryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GalleryItems_Users_ExecutorId",
                        column: x => x.ExecutorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Budget = table.Column<decimal>(type: "numeric", nullable: false),
                    Deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectRequests_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectRequests_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceApprovalLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    AdminId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceApprovalLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceApprovalLogs_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceApprovalLogs_Users_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectInvitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExecutorId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectInvitations_ProjectRequests_ProjectRequestId",
                        column: x => x.ProjectRequestId,
                        principalTable: "ProjectRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectInvitations_Users_ExecutorId",
                        column: x => x.ExecutorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectOffers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExecutorId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProposedPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    ProposedDays = table.Column<int>(type: "integer", nullable: false),
                    CoverLetter = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectOffers_ProjectRequests_ProjectRequestId",
                        column: x => x.ProjectRequestId,
                        principalTable: "ProjectRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectOffers_Users_ExecutorId",
                        column: x => x.ExecutorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Chats_ProjectOfferId",
                table: "Chats",
                column: "ProjectOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_GalleryItems_ExecutorId",
                table: "GalleryItems",
                column: "ExecutorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectInvitations_ExecutorId",
                table: "ProjectInvitations",
                column: "ExecutorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectInvitations_ProjectRequestId",
                table: "ProjectInvitations",
                column: "ProjectRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectOffers_ExecutorId",
                table: "ProjectOffers",
                column: "ExecutorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectOffers_ProjectRequestId",
                table: "ProjectOffers",
                column: "ProjectRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRequests_CategoryId",
                table: "ProjectRequests",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRequests_StudentId",
                table: "ProjectRequests",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceApprovalLogs_AdminId",
                table: "ServiceApprovalLogs",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceApprovalLogs_ServiceId",
                table: "ServiceApprovalLogs",
                column: "ServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Chats_ProjectOffers_ProjectOfferId",
                table: "Chats",
                column: "ProjectOfferId",
                principalTable: "ProjectOffers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chats_ProjectOffers_ProjectOfferId",
                table: "Chats");

            migrationBuilder.DropTable(
                name: "GalleryItems");

            migrationBuilder.DropTable(
                name: "ProjectInvitations");

            migrationBuilder.DropTable(
                name: "ProjectOffers");

            migrationBuilder.DropTable(
                name: "ServiceApprovalLogs");

            migrationBuilder.DropTable(
                name: "ProjectRequests");

            migrationBuilder.DropIndex(
                name: "IX_Chats_ProjectOfferId",
                table: "Chats");

            migrationBuilder.DropColumn(
                name: "LastActiveAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TotalWorkHours",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProjectOfferId",
                table: "Chats");
        }
    }
}

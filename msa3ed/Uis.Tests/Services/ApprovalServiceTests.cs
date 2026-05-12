using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Services;

public class ApprovalServiceTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task ApproveServiceAsync_ShouldSetStatusToActive()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new ApprovalService(db);
        var s = new Service { Title = "Test", Status = "PendingApproval" };
        db.Services.Add(s);
        var admin = new User { FullName = "Admin" };
        db.Users.Add(admin);
        await db.SaveChangesAsync();

        // Act
        var result = await service.ApproveServiceAsync(s.Id, admin.Id);

        // Assert
        Assert.True(result);
        var updated = await db.Services.FindAsync(s.Id);
        Assert.Equal("Active", updated?.Status);
        Assert.True(updated?.IsActive);
        Assert.True(await db.ServiceApprovalLogs.AnyAsync(l => l.ServiceId == s.Id && l.Action == "Approved"));
    }

    [Fact]
    public async Task RejectServiceAsync_ShouldSetStatusToRejected()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new ApprovalService(db);
        var s = new Service { Title = "Test", Status = "PendingApproval" };
        db.Services.Add(s);
        var admin = new User { FullName = "Admin" };
        db.Users.Add(admin);
        await db.SaveChangesAsync();

        // Act
        var result = await service.RejectServiceAsync(s.Id, admin.Id, "Bad description");

        // Assert
        Assert.True(result);
        var updated = await db.Services.FindAsync(s.Id);
        Assert.Equal("Rejected", updated?.Status);
        Assert.Equal("Bad description", updated?.RejectionReason);
        Assert.False(updated?.IsActive);
    }
}

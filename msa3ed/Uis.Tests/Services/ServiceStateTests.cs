using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Services;

public class ServiceStateTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task ServiceLifecycle_ShouldFollowStatusTransitions()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new ServiceService(db);
        var executorId = Guid.NewGuid();
        
        var s = new Service 
        { 
            Title = "Lifecycle Test", 
            ExecutorId = executorId, 
            Status = "Draft",
            CategoryId = Guid.NewGuid()
        };
        db.Services.Add(s);
        await db.SaveChangesAsync();

        // Act & Assert 1: Submit for Review
        await service.SubmitForReviewAsync(s.Id);
        var status1 = (await db.Services.FindAsync(s.Id))?.Status;
        Assert.Equal("PendingApproval", status1);

        // Act & Assert 2: Approve
        await service.ApproveServiceAsync(s.Id);
        var status2 = (await db.Services.FindAsync(s.Id))?.Status;
        Assert.Equal("Active", status2);

        // Act & Assert 3: Pause
        await service.PauseServiceAsync(s.Id);
        var status3 = (await db.Services.FindAsync(s.Id))?.Status;
        Assert.Equal("Paused", status3);

        // Act & Assert 4: Resume
        await service.ResumeServiceAsync(s.Id);
        var status4 = (await db.Services.FindAsync(s.Id))?.Status;
        Assert.Equal("Active", status4);

        // Act & Assert 5: Reject (from PendingApproval)
        var s2 = new Service { Title = "Reject Test", Status = "PendingApproval" };
        db.Services.Add(s2);
        await db.SaveChangesAsync();
        
        await service.RejectServiceAsync(s2.Id, "Inappropriate content");
        var rejected = await db.Services.FindAsync(s2.Id);
        Assert.Equal("Rejected", rejected?.Status);
        Assert.Equal("Inappropriate content", rejected?.RejectionReason);
    }
}

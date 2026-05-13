using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Admin;

/// Feature 013 T043-T045: Service approval workflow tests
public class ApproveServiceTests
{
    private ApplicationDbContext GetDbContext()
    {
        var opts = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(opts);
    }

    [Fact]
    public void NewService_DefaultStatus_IsPendingApproval()
    {
        var service = new Service { Title = "My Service" };
        Assert.Equal("PendingApproval", service.Status);
        Assert.False(service.IsActive);
    }

    [Fact]
    public async Task ApproveService_SetsActive_AndCreatesAuditLog()
    {
        using var db = GetDbContext();
        var executor = new User { FullName = "Sara", IsExecutor = true };
        var admin = new User { FullName = "Admin", IsAdmin = true };
        var service = new Service { Title = "Service", Status = "PendingApproval", IsActive = false, ExecutorId = executor.Id };
        db.Users.Add(executor); db.Users.Add(admin); db.Services.Add(service);
        await db.SaveChangesAsync();

        var svc = new ApprovalService(db);
        await svc.ApproveServiceAsync(service.Id, admin.Id);

        var updated = await db.Services.FindAsync(service.Id);
        Assert.Equal("Active", updated!.Status);
        Assert.True(updated.IsActive);
        Assert.True(await db.ServiceApprovalLogs.AnyAsync(l => l.ServiceId == service.Id && l.Action == "Approved"));
    }

    [Fact]
    public async Task RejectService_SetsRejected_ActiveOrdersUnaffected()
    {
        using var db = GetDbContext();
        var executor = new User { FullName = "Executor", IsExecutor = true };
        var student = new User { FullName = "Student" };
        var admin = new User { FullName = "Admin", IsAdmin = true };
        db.Users.AddRange(executor, student, admin);
        await db.SaveChangesAsync();

        var service = new Service { Title = "Service", Status = "Active", IsActive = true, ExecutorId = executor.Id };
        db.Services.Add(service);
        await db.SaveChangesAsync();

        var order = new Order { ServiceId = service.Id, StudentId = student.Id, ExecutorId = executor.Id, Status = "InProgress", Price = 100m };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var svc = new ApprovalService(db);
        await svc.RejectServiceAsync(service.Id, admin.Id, "Policy violation");

        var updatedService = await db.Services.FindAsync(service.Id);
        Assert.Equal("Rejected", updatedService!.Status);
        Assert.False(updatedService.IsActive);

        var updatedOrder = await db.Orders.FindAsync(order.Id);
        Assert.Equal("InProgress", updatedOrder!.Status); // not cancelled
    }

    [Fact]
    public async Task SearchService_OnlyReturnsActiveServices()
    {
        using var db = GetDbContext();
        var cat = new Category { Name = "Design" };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();

        db.Services.AddRange(
            new Service { Title = "Active", Status = "Active", IsActive = true, CategoryId = cat.Id },
            new Service { Title = "Pending", Status = "PendingApproval", CategoryId = cat.Id },
            new Service { Title = "Rejected", Status = "Rejected", CategoryId = cat.Id }
        );
        await db.SaveChangesAsync();

        var searchSvc = new SearchService(db);
        var (results, _) = await searchSvc.SearchServicesAsync(null, null, null, null, null, null, null, null, null, 1, 20);

        Assert.All(results, s => Assert.Equal("Active", s.Status));
    }
}

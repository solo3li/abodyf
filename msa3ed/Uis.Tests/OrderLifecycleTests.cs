using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uis.Server.Controllers.Api;
using Uis.Server.Data;
using Uis.Server.DTOs;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;
using Moq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Uis.Tests;

public class OrderLifecycleTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CompleteOrder_ShouldReleaseEscrow_And_CreditExecutor()
    {
        // Arrange
        using var db = GetDbContext();
        var studentId = Guid.NewGuid();
        var executorId = Guid.NewGuid();
        var category = new Category { Id = Guid.NewGuid(), Name = "Testing" };
        var service = new Service { Id = Guid.NewGuid(), Title = "Test Service", BasePrice = 100, CategoryId = category.Id, ExecutorId = executorId };
        
        var order = new Order { Id = Guid.NewGuid(), StudentId = studentId, ExecutorId = executorId, ServiceId = service.Id, Price = 100, Status = "InProgress" };
        var escrow = new Escrow { OrderId = order.Id, Amount = 100, Status = "Held" };
        
        db.Users.Add(new User { Id = studentId, FullName = "Student" });
        db.Users.Add(new User { Id = executorId, FullName = "Executor", WalletBalance = 0 });
        db.Categories.Add(category);
        db.Services.Add(service);
        db.Orders.Add(order);
        db.Escrows.Add(escrow);
        db.SystemSettings.Add(new SystemSetting { Key = "CommissionRate", Value = "10" });
        await db.SaveChangesAsync();

        var walletService = new WalletService(db);
        var escrowService = new EscrowService(db);
        var controller = new OrdersController(db, walletService, escrowService);

        // Mock User identity (Executor)
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
            new Claim(ClaimTypes.NameIdentifier, executorId.ToString()),
        }, "mock"));
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = user } };

        // Act
        var result = await controller.Complete(order.Id);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        
        var updatedOrder = await db.Orders.FindAsync(order.Id);
        Assert.Equal("Completed", updatedOrder.Status);

        var updatedEscrow = await db.Escrows.FirstOrDefaultAsync(e => e.OrderId == order.Id);
        Assert.Equal("Released", updatedEscrow.Status);

        var executor = await db.Users.FindAsync(executorId);
        Assert.Equal(90, executor.WalletBalance); // 100 - 10% commission
    }
}

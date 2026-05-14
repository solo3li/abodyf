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

public class OrderIntegrationTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateOrder_ShouldFail_WhenBalanceIsInsufficient()
    {
        // Arrange
        using var db = GetDbContext();
        var studentId = Guid.NewGuid();
        var category = new Category { Id = Guid.NewGuid(), Name = "Testing" };
        var service = new Service { Id = Guid.NewGuid(), Title = "Test Service", BasePrice = 100, CategoryId = category.Id };
        
        db.Users.Add(new User { Id = studentId, FullName = "Student", WalletBalance = 50 }); // Low balance
        db.Categories.Add(category);
        db.Services.Add(service);
        await db.SaveChangesAsync();

        var walletService = new WalletService(db);
        var escrowService = new EscrowService(db);
        var controller = new OrdersController(db, walletService, escrowService);

        // Mock User identity
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
            new Claim(ClaimTypes.NameIdentifier, studentId.ToString()),
        }, "mock"));
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = user } };

        var createDto = new CreateOrderDto { ServiceId = service.Id, Price = 100 };

        // Act
        var result = await controller.Create(createDto);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("رصيدك غير كافٍ", badRequest.Value.ToString());
    }

    [Fact]
    public async Task CreateOrder_ShouldHoldEscrow_WhenBalanceIsSufficient()
    {
        // Arrange
        using var db = GetDbContext();
        var studentId = Guid.NewGuid();
        var category = new Category { Id = Guid.NewGuid(), Name = "Testing" };
        var service = new Service { Id = Guid.NewGuid(), Title = "Test Service", BasePrice = 100, CategoryId = category.Id };
        
        db.Users.Add(new User { Id = studentId, FullName = "Student", WalletBalance = 200 }); // Enough balance
        db.Categories.Add(category);
        db.Services.Add(service);
        await db.SaveChangesAsync();

        var walletService = new WalletService(db);
        var escrowService = new EscrowService(db);
        var controller = new OrdersController(db, walletService, escrowService);

        // Mock User identity
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
            new Claim(ClaimTypes.NameIdentifier, studentId.ToString()),
        }, "mock"));
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = user } };

        var createDto = new CreateOrderDto { ServiceId = service.Id, Price = 100 };

        // Act
        var result = await controller.Create(createDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var student = await db.Users.FindAsync(studentId);
        Assert.Equal(100, student.WalletBalance); // Deducted

        var escrow = await db.Escrows.FirstOrDefaultAsync(e => e.OrderId == ((Order)okResult.Value).Id);
        Assert.NotNull(escrow);
        Assert.Equal(100, escrow.Amount);
    }
}

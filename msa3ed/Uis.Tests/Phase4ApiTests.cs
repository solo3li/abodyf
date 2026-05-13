using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Moq;
using Uis.Server.Controllers;
using Uis.Server.Controllers.Api;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;
using Microsoft.AspNetCore.Http;

namespace Uis.Tests;

public class Phase4ApiTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task T011_GetServices_ShouldReturnFilteredResults()
    {
        // Arrange
        using var db = GetDbContext();
        var category1 = new Category { Id = Guid.NewGuid(), Name = "Cat 1" };
        var category2 = new Category { Id = Guid.NewGuid(), Name = "Cat 2" };
        
        db.Categories.AddRange(category1, category2);
        db.Services.AddRange(
            new Service { Id = Guid.NewGuid(), Title = "Service A", Description = "Desc A", BasePrice = 100, CategoryId = category1.Id, IsActive = true },
            new Service { Id = Guid.NewGuid(), Title = "Service B", Description = "Desc B", BasePrice = 200, CategoryId = category1.Id, IsActive = true },
            new Service { Id = Guid.NewGuid(), Title = "Service C", Description = "Desc C", BasePrice = 300, CategoryId = category2.Id, IsActive = true },
            new Service { Id = Guid.NewGuid(), Title = "Service D", Description = "Desc D", BasePrice = 400, CategoryId = category2.Id, IsActive = false }
        );
        await db.SaveChangesAsync();

        var controller = new ServicesController(db);

        // Act & Assert

        // 1. Search filter
        var searchResult = await controller.GetAll(search: "Service A", null, null, null, null) as OkObjectResult;
        Assert.NotNull(searchResult);
        var searchList = searchResult.Value as IEnumerable<dynamic>;
        Assert.Single(searchList!);

        // 2. Category filter
        var catResult = await controller.GetAll(null, category1.Id, null, null, null) as OkObjectResult;
        var catList = catResult!.Value as IEnumerable<dynamic>;
        Assert.Equal(2, catList!.Count());

        // 3. Price filter
        var priceResult = await controller.GetAll(null, null, 150, 250, null) as OkObjectResult;
        var priceList = priceResult!.Value as IEnumerable<dynamic>;
        Assert.Single(priceList!);

        // 4. Combined filters
        var combinedResult = await controller.GetAll("Service", category2.Id, 250, 350, null) as OkObjectResult;
        var combinedList = combinedResult!.Value as IEnumerable<dynamic>;
        Assert.Single(combinedList!);
    }

    [Fact]
    public async Task T012_AdminWalletList_ShouldReturnUsersWithBalances()
    {
        // Arrange
        using var db = GetDbContext();
        db.Users.AddRange(
            new User { Id = Guid.NewGuid(), FullName = "User 1", Email = "u1@test.com", WalletBalance = 500 },
            new User { Id = Guid.NewGuid(), FullName = "User 2", Email = "u2@test.com", WalletBalance = 1000 }
        );
        await db.SaveChangesAsync();

        var walletServiceMock = new Mock<IWalletService>();
        var auditMock = new Mock<IAuditLogService>();
        
        var controller = new AdminController(db, null!, null!, null!, walletServiceMock.Object, auditMock.Object);

        // Act
        var result = await controller.WalletList() as ViewResult;

        // Assert
        Assert.NotNull(result);
        var model = result.Model as IEnumerable<User>;
        Assert.NotNull(model);
        Assert.Equal(2, model.Count());
        Assert.Contains(model, u => u.WalletBalance == 1000);
    }

    [Fact]
    public async Task T013_AdminAuditLogs_ShouldReturnRecentLogs()
    {
        // Arrange
        using var db = GetDbContext();
        var admin = new User { Id = Guid.NewGuid(), FullName = "Admin", Email = "admin@uis.com" };
        db.Users.Add(admin);
        db.AuditLogs.AddRange(
            new AuditLog { Id = Guid.NewGuid(), AdminId = admin.Id, Action = "Action 1", TargetEntityType = "User", TargetEntityId = "1", Details = "Details 1", CreatedAt = DateTime.UtcNow },
            new AuditLog { Id = Guid.NewGuid(), AdminId = admin.Id, Action = "Action 2", TargetEntityType = "System", TargetEntityId = "2", Details = "Details 2", CreatedAt = DateTime.UtcNow.AddMinutes(-10) }
        );
        await db.SaveChangesAsync();

        var controller = new AdminController(db, null!, null!, null!, null!, null!);

        // Act
        var result = await controller.AuditLogs("User") as ViewResult;

        // Assert
        Assert.NotNull(result);
        var model = result.Model as IEnumerable<AuditLog>;
        Assert.NotNull(model);
        Assert.Single(model);
        Assert.Equal("User", model.First().TargetEntityType);
    }

    [Fact]
    public async Task T014_AdminWalletCreditAndDebit_ShouldCallWalletService()
    {
        // Arrange
        using var db = GetDbContext();
        var walletServiceMock = new Mock<IWalletService>();
        var auditMock = new Mock<IAuditLogService>();
        
        walletServiceMock.Setup(s => s.AdminCreditAsync(It.IsAny<Guid>(), It.IsAny<decimal>(), It.IsAny<string>()))
            .ReturnsAsync((true, 100m, "Success Credit"));
            
        walletServiceMock.Setup(s => s.AdminDebitAsync(It.IsAny<Guid>(), It.IsAny<decimal>(), It.IsAny<string>()))
            .ReturnsAsync((true, 50m, "Success Debit"));

        var adminId = Guid.NewGuid();
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
            new Claim(ClaimTypes.NameIdentifier, adminId.ToString())
        }, "mock"));

        var controller = new AdminController(db, null!, null!, null!, walletServiceMock.Object, auditMock.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = user } },
            TempData = new Microsoft.AspNetCore.Mvc.ViewFeatures.TempDataDictionary(new DefaultHttpContext(), Mock.Of<Microsoft.AspNetCore.Mvc.ViewFeatures.ITempDataProvider>())
        };

        var targetUserId = Guid.NewGuid();

        // Act - Credit
        var creditResult = await controller.WalletCredit(targetUserId, 100, "Bonus");
        
        // Assert - Credit
        walletServiceMock.Verify(s => s.AdminCreditAsync(targetUserId, 100, "Bonus"), Times.Once);
        auditMock.Verify(a => a.LogActionAsync(adminId, "WalletCredit", "User", targetUserId.ToString(), It.IsAny<string>()), Times.Once);
        Assert.IsType<RedirectToActionResult>(creditResult);

        // Act - Debit
        var debitResult = await controller.WalletDebit(targetUserId, 50, "Penalty");
        
        // Assert - Debit
        walletServiceMock.Verify(s => s.AdminDebitAsync(targetUserId, 50, "Penalty"), Times.Once);
        auditMock.Verify(a => a.LogActionAsync(adminId, "WalletDebit", "User", targetUserId.ToString(), It.IsAny<string>()), Times.Once);
        Assert.IsType<RedirectToActionResult>(debitResult);
    }

    [Fact]
    public void T015_VerifyAdminController_HasAdminAuthorizationAttribute()
    {
        // Arrange
        var type = typeof(AdminController);

        // Act
        var authorizeAttributes = type.GetCustomAttributes<AuthorizeAttribute>(inherit: true).ToList();

        // Assert
        Assert.NotEmpty(authorizeAttributes);
        var adminAttr = authorizeAttributes.FirstOrDefault(a => a.Roles == "Admin");
        Assert.NotNull(adminAttr);
    }
}

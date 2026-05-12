using Microsoft.AspNetCore.Mvc;
using Moq;
using Uis.Server.Controllers.Api;
using Uis.Server.Data;
using Uis.Server.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Uis.Tests.Controllers;

public class ExecutorsControllerAdvancedTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetExecutors_ShouldFilterByAdvancedCriteria()
    {
        // Arrange
        using var db = GetDbContext();
        var controller = new ExecutorsController(db);
        db.Users.AddRange(
            new User { FullName = "Ahmed", IsExecutor = true, IsActive = true, Rating = 5.0m, CompletedOrdersCount = 10 },
            new User { FullName = "Sara", IsExecutor = true, IsActive = true, Rating = 4.0m, CompletedOrdersCount = 2 }
        );
        await db.SaveChangesAsync();

        // Act - Search for minRating = 4.5
        var result = await controller.GetExecutors(null, null, null, 4.5m, null);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var executors = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
        Assert.Single(executors); // Only Ahmed should match
    }
}

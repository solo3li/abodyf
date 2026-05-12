using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uis.Server.Controllers.Api;
using Uis.Server.Data;
using Uis.Server.Models;
using Xunit;

namespace Uis.Tests.Controllers;

public class ExecutorsControllerTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetExecutors_ShouldFilterBySearchTerm()
    {
        // Arrange
        using var db = GetDbContext();
        var controller = new ExecutorsController(db);
        db.Users.AddRange(
            new User { FullName = "Ahmed Tech", IsExecutor = true, IsActive = true },
            new User { FullName = "Sara Design", IsExecutor = true, IsActive = true },
            new User { FullName = "Non Executor", IsExecutor = false, IsActive = true }
        );
        await db.SaveChangesAsync();

        // Act
        var result = await controller.GetExecutors("Ahmed", null, null);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var executors = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
        Assert.Single(executors);
    }
}

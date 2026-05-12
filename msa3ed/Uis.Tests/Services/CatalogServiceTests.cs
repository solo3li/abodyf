using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Services;

public class CatalogServiceTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetServicesAsync_ShouldFilterBySearchTerm()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new CatalogService(db);
        
        var cat = new Category { Name = "Programming" };
        db.Categories.Add(cat);
        
        db.Services.AddRange(
            new Service { Title = "React Development", Description = "Build apps", IsActive = true, Status = "Active", Category = cat },
            new Service { Title = "Python Scripting", Description = "Automation", IsActive = true, Status = "Active", Category = cat },
            new Service { Title = "UI Design", Description = "Design interfaces", IsActive = true, Status = "Active", Category = cat }
        );
        await db.SaveChangesAsync();

        // Act
        var results = await service.GetServicesAsync(searchTerm: "Python");

        // Assert
        Assert.Single(results);
        Assert.Equal("Python Scripting", results.First().Title);
    }
}

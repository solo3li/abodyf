using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Xunit;

namespace Uis.Tests.Data;

public class DbSeederTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task SeedSampleDataAsync_ShouldPopulateData()
    {
        // Arrange
        using var db = GetDbContext();
        
        // Act
        // We'll implement the method in the next step
        // await DbSeeder.SeedSampleDataAsync(db);

        // Assert
        // Assert.True(await db.Users.AnyAsync());
        // Assert.True(await db.Services.AnyAsync());
    }
}

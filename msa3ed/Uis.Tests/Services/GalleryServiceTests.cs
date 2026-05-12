using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Services;

public class GalleryServiceTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task AddGalleryItemAsync_ShouldCreateItem()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new GalleryService(db);
        var executorId = Guid.NewGuid();

        // Act
        var result = await service.AddGalleryItemAsync(executorId, "Logo", "Desc", "url", "Image");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Logo", result.Title);
        Assert.Equal(executorId, result.ExecutorId);
        Assert.True(await db.GalleryItems.AnyAsync(g => g.Id == result.Id));
    }

    [Fact]
    public async Task GetGalleryAsync_ShouldReturnExecutorItems()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new GalleryService(db);
        var ex1 = Guid.NewGuid();
        var ex2 = Guid.NewGuid();
        db.GalleryItems.AddRange(
            new GalleryItem { ExecutorId = ex1, Title = "I1" },
            new GalleryItem { ExecutorId = ex1, Title = "I2" },
            new GalleryItem { ExecutorId = ex2, Title = "I3" }
        );
        await db.SaveChangesAsync();

        // Act
        var result = await service.GetGalleryAsync(ex1);

        // Assert
        Assert.Equal(2, result.Count());
    }
}

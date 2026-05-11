using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests;

public class FavoritesTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task ToggleFavoriteAsync_ShouldAddFavorite_WhenNotExists()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new FavoritesService(db);
        var userId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();

        // Act
        var result = await service.ToggleFavoriteAsync(userId, serviceId);

        // Assert
        Assert.True(result);
        var favorite = await db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ServiceId == serviceId);
        Assert.NotNull(favorite);
    }

    [Fact]
    public async Task ToggleFavoriteAsync_ShouldRemoveFavorite_WhenExists()
    {
        // Arrange
        using var db = GetDbContext();
        var userId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        db.Favorites.Add(new Favorite { UserId = userId, ServiceId = serviceId });
        await db.SaveChangesAsync();
        
        var service = new FavoritesService(db);

        // Act
        var result = await service.ToggleFavoriteAsync(userId, serviceId);

        // Assert
        Assert.False(result);
        var favorite = await db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ServiceId == serviceId);
        Assert.Null(favorite);
    }
}

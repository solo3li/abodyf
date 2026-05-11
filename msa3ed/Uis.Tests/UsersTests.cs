using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Uis.Server.DTOs;
using Xunit;

namespace Uis.Tests;

public class UsersTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task UpdateProfileAsync_ShouldUpdateUserData_WhenValid()
    {
        // Arrange
        using var db = GetDbContext();
        var user = new User { FullName = "Old Name", University = "Old Uni", Email = "user@test.com" };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new UserService(db);
        var dto = new UpdateProfileDto { FullName = "New Name", University = "New Uni", Bio = "New Bio" };

        // Act
        var result = await service.UpdateProfileAsync(user.Id, dto);

        // Assert
        Assert.True(result);
        var updatedUser = await db.Users.FindAsync(user.Id);
        Assert.Equal("New Name", updatedUser?.FullName);
        Assert.Equal("New Uni", updatedUser?.University);
        Assert.Equal("New Bio", updatedUser?.Bio);
    }

    [Fact]
    public async Task UpdateProfileAsync_ShouldFail_WhenNameIsEmpty()
    {
        // Arrange
        using var db = GetDbContext();
        var user = new User { FullName = "Old Name", University = "Old Uni", Email = "user@test.com" };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new UserService(db);
        var dto = new UpdateProfileDto { FullName = "", University = "New Uni" };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateProfileAsync(user.Id, dto));
    }
}

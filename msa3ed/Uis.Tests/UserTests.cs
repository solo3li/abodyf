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

public class UserContractTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task UpdateProfile_ShouldReturn200_WhenDataIsValid()
    {
        // Arrange
        using var db = GetDbContext();
        var userId = Guid.NewGuid();
        db.Users.Add(new User { Id = userId, FullName = "Old Name", Email = "user@uis.com" });
        await db.SaveChangesAsync();

        var userService = new UserService(db);
        var controller = new UsersController(userService, db);
        
        // Mock User identity
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        }, "mock"));
        
        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var updateDto = new UpdateProfileDto 
        { 
            FullName = "New Name", 
            University = "UIS University",
            Major = "CS",
            Bio = "New Bio"
        };

        // Act
        var result = await controller.UpdateProfile(updateDto);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        var updatedUser = await db.Users.FindAsync(userId);
        Assert.Equal("New Name", updatedUser.FullName);
        Assert.Equal("UIS University", updatedUser.University);
    }
}

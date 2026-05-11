using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Uis.Server.Controllers.Api;
using Uis.Server.Data;
using Uis.Server.DTOs;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests;

public class AuthControllerTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task Login_ShouldReturnTokenAndUser_WhenCredentialsAreValid()
    {
        // Arrange
        var mockAuth = new Mock<IAuthService>();
        var mockOtp = new Mock<IOtpService>();
        using var db = GetDbContext();
        var controller = new AuthController(mockAuth.Object, mockOtp.Object, db);

        var loginDto = new LoginDto { Email = "test@uis.com", Password = "password123" };
        var authResponse = new AuthResponseDto
        {
            Token = "fake-jwt-token",
            User = new UserDto
            {
                Id = Guid.NewGuid(),
                Name = "Test User",
                Email = "test@uis.com",
                IsExecutor = false,
                Roles = new List<string> { "Student" }
            }
        };

        mockAuth.Setup(a => a.LoginAsync(loginDto)).ReturnsAsync(authResponse);

        // Act
        var result = await controller.Login(loginDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value;
        
        // Use reflection or dynamic to check properties since it's an anonymous object in controller
        var tokenProp = response.GetType().GetProperty("Token");
        var userProp = response.GetType().GetProperty("User");

        Assert.NotNull(tokenProp);
        Assert.NotNull(userProp);
        Assert.Equal("fake-jwt-token", tokenProp.GetValue(response));
    }

    [Fact]
    public async Task Register_ShouldReturnTokenAndUser_WhenRegistrationIsSuccessful()
    {
        // Arrange
        var mockAuth = new Mock<IAuthService>();
        var mockOtp = new Mock<IOtpService>();
        using var db = GetDbContext();
        var controller = new AuthController(mockAuth.Object, mockOtp.Object, db);

        var registerDto = new RegisterDto { Email = "new@uis.com", FullName = "New User", Password = "password123" };
        var authResponse = new AuthResponseDto
        {
            Token = "new-user-token",
            User = new UserDto
            {
                Id = Guid.NewGuid(),
                Name = "New User",
                Email = "new@uis.com",
                IsExecutor = false,
                Roles = new List<string> { "Student" }
            }
        };

        mockAuth.Setup(a => a.RegisterAsync(registerDto)).ReturnsAsync(authResponse);

        // Act
        var result = await controller.Register(registerDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value;
        
        var tokenProp = response.GetType().GetProperty("Token");
        Assert.Equal("new-user-token", tokenProp.GetValue(response));
    }
}

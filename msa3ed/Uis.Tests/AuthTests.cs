using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uis.Server.Controllers.Api;
using Uis.Server.Data;
using Uis.Server.DTOs;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;
using Moq;

namespace Uis.Tests;

public class AuthIntegrationTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task Register_And_Login_ShouldWork_WithoutOTP()
    {
        // Arrange
        using var db = GetDbContext();
        var jwtMock = new Mock<IJwtService>();
        jwtMock.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("fake-jwt");
        
        var otpService = new OtpService(db, new Mock<IEmailService>().Object);
        var authService = new AuthService(db, jwtMock.Object, otpService);
        var controller = new AuthController(authService, otpService, db);

        var registerDto = new RegisterDto 
        { 
            Email = "integration@uis.com", 
            FullName = "Integration User", 
            Password = "password123" 
        };

        // Act - Register
        var registerResult = await controller.Register(registerDto);
        var regOk = Assert.IsType<OkObjectResult>(registerResult);
        var regResponse = Assert.IsType<AuthResponseDto>(regOk.Value);

        // Assert - Register
        Assert.Equal("integration@uis.com", regResponse.User.Email);
        Assert.NotNull(regResponse.Token);

        // Act - Login
        var loginDto = new LoginDto { Email = "integration@uis.com", Password = "password123" };
        var loginResult = await controller.Login(loginDto);
        var loginOk = Assert.IsType<OkObjectResult>(loginResult);
        var loginResponse = Assert.IsType<AuthResponseDto>(loginOk.Value);

        // Assert - Login
        Assert.Equal("integration@uis.com", loginResponse.User.Email);
        Assert.Equal("fake-jwt", loginResponse.Token);
    }

    [Fact]
    public async Task ForgotPassword_ShouldIndicateBypassMode()
    {
        // Arrange
        using var db = GetDbContext();
        db.Users.Add(new User { Email = "forget@uis.com", PasswordHash = "old" });
        await db.SaveChangesAsync();

        var otpService = new OtpService(db, new Mock<IEmailService>().Object);
        var controller = new AuthController(new Mock<IAuthService>().Object, otpService, db);

        // Act
        var result = await controller.ForgotPassword("forget@uis.com");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var messageProp = okResult.Value.GetType().GetProperty("Message");
        Assert.Contains("Bypass Mode", messageProp.GetValue(okResult.Value).ToString());
    }
}

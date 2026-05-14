using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Uis.Server.Controllers.Api;
using Uis.Server.Models;
using Uis.Server.Data;
using Microsoft.AspNetCore.Http;
using Moq;
using Uis.Server.Services;

namespace Uis.Tests;

public class WalletControllerTests : ApiTestBase
{
    private readonly WalletController _controller;
    private readonly Mock<IWalletService> _walletServiceMock;

    public WalletControllerTests()
    {
        _walletServiceMock = new Mock<IWalletService>();
        _controller = new WalletController(_db, _walletServiceMock.Object);
    }

    [Fact]
    public async Task GetWallet_ReturnsNotFound_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        // Act
        var result = await _controller.GetWallet();

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetWallet_ReturnsOk_WhenUserExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var userRecord = new User { Id = userId, FullName = "Test User", WalletBalance = 100 };
        _db.Users.Add(userRecord);
        await _db.SaveChangesAsync();

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        // Act
        var result = await _controller.GetWallet();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }
}

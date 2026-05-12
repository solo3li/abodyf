using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Uis.Server.Controllers.Api;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Controllers;

public class ServicesControllerTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetAll_ShouldPassSearchTermToService()
    {
        // Arrange
        var mockCatalog = new Mock<ICatalogService>();
        mockCatalog.Setup(c => c.GetServicesAsync(null, null, "test"))
                   .ReturnsAsync(new List<Service> { new Service { Title = "Test Service" } });
        
        var controller = new ServicesController(mockCatalog.Object);

        // Act
        var result = await controller.GetAll(null, null, "test");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        mockCatalog.Verify(c => c.GetServicesAsync(null, null, "test"), Times.Once);
    }
}

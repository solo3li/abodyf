using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;
using Uis.Server.Controllers.Api;
using Uis.Server.Data;
using Uis.Server.DTOs;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Services;

public class ServiceCreationTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    private ClaimsPrincipal GetUser(Guid userId)
    {
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        return new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task CreateService_ShouldReturnCreatedAtAction()
    {
        // Arrange
        using var db = GetDbContext();
        var mockFileService = new Mock<IFileService>();
        var serviceService = new ServiceService(db);
        var controller = new ExecutorServicesController(serviceService, mockFileService.Object);
        
        var executorId = Guid.NewGuid();
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = GetUser(executorId) }
        };

        var category = new Category { Name = "Design" };
        db.Categories.Add(category);
        await db.SaveChangesAsync();

        var dto = new CreateServiceDto
        {
            Title = "Logo Design",
            Description = "Professional logo design",
            BasePrice = 50,
            CategoryId = category.Id,
            EstimatedDeliveryDays = 2,
            IncludedRevisions = 5
        };

        // Act
        var result = await controller.CreateService(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var responseDto = Assert.IsType<ServiceDto>(createdResult.Value);
        Assert.Equal("Logo Design", responseDto.Title);
        Assert.Equal("Draft", responseDto.Status);
    }

    [Fact]
    public async Task GetMyServices_ShouldOnlyReturnExecutorServices()
    {
        // Arrange
        using var db = GetDbContext();
        var mockFileService = new Mock<IFileService>();
        var serviceService = new ServiceService(db);
        var controller = new ExecutorServicesController(serviceService, mockFileService.Object);
        
        var executor1Id = Guid.NewGuid();
        var executor2Id = Guid.NewGuid();
        
        var cat = new Category { Name = "Cat" };
        db.Categories.Add(cat);
        
        db.Services.AddRange(
            new Service { Title = "S1", ExecutorId = executor1Id, Category = cat },
            new Service { Title = "S2", ExecutorId = executor1Id, Category = cat },
            new Service { Title = "S3", ExecutorId = executor2Id, Category = cat }
        );
        await db.SaveChangesAsync();

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = GetUser(executor1Id) }
        };

        // Act
        var result = await controller.GetMyServices();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var services = Assert.IsAssignableFrom<IEnumerable<ServiceSummaryDto>>(okResult.Value);
        Assert.Equal(2, services.Count());
    }
}

using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.DTOs;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Services;

public class ServiceValidationTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateServiceAsync_ShouldCreateServiceInDraftStatus()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new ServiceService(db);
        var executorId = Guid.NewGuid();
        var category = new Category { Name = "Programming" };
        db.Categories.Add(category);
        await db.SaveChangesAsync();

        var dto = new CreateServiceDto
        {
            Title = "Test Service",
            Description = "Test Description",
            BasePrice = 100,
            CategoryId = category.Id,
            EstimatedDeliveryDays = 3,
            IncludedRevisions = 2,
            Tags = new List<string> { "Tag1", "Tag2" }
        };

        // Act
        var result = await service.CreateServiceAsync(executorId, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Draft", result.Status);
        Assert.Equal(executorId, result.ExecutorId);
        Assert.Equal(2, result.ServiceOfferingTags.Count);
        
        var savedService = await db.Services.Include(s => s.ServiceOfferingTags).FirstOrDefaultAsync(s => s.Id == result.Id);
        Assert.NotNull(savedService);
        Assert.Equal("Draft", savedService.Status);
    }

    [Fact]
    public async Task UpdateServiceAsync_ShouldUpdateAllFields()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new ServiceService(db);
        var executorId = Guid.NewGuid();
        var category1 = new Category { Name = "Cat1" };
        var category2 = new Category { Name = "Cat2" };
        db.Categories.AddRange(category1, category2);
        await db.SaveChangesAsync();

        var initialService = await service.CreateServiceAsync(executorId, new CreateServiceDto
        {
            Title = "Initial Title",
            CategoryId = category1.Id,
            Tags = new List<string> { "InitialTag" }
        });

        var updateDto = new UpdateServiceDto
        {
            Title = "Updated Title",
            Description = "Updated Desc",
            BasePrice = 200,
            CategoryId = category2.Id,
            EstimatedDeliveryDays = 5,
            IncludedRevisions = 3,
            Tags = new List<string> { "NewTag1", "NewTag2" }
        };

        // Act
        await service.UpdateServiceAsync(initialService.Id, updateDto);

        // Assert
        var updated = await db.Services.Include(s => s.ServiceOfferingTags).ThenInclude(t => t.Tag).FirstOrDefaultAsync(s => s.Id == initialService.Id);
        Assert.Equal("Updated Title", updated.Title);
        Assert.Equal(category2.Id, updated.CategoryId);
        Assert.Equal(200, updated.BasePrice);
        Assert.Equal(2, updated.ServiceOfferingTags.Count);
        Assert.Contains(updated.ServiceOfferingTags, t => t.Tag.Name == "NewTag1");
    }
}

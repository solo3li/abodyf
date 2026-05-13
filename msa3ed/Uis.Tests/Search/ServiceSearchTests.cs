using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Search;

/// Feature 013 T060: Search with all 7 filter params returns only Active services
/// Feature 013 T061: Admin executor search filters correctly
/// Feature 013 T062: SearchService correctly chains EF Where clauses
public class ServiceSearchTests
{
    private ApplicationDbContext GetDbContext()
    {
        var opts = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(opts);
    }

    [Fact]
    public async Task Search_Keyword_FiltersTitle()
    {
        using var db = GetDbContext();
        var cat = new Category { Name = "IT" };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();

        db.Services.AddRange(
            new Service { Title = "Web Design", Status = "Active", IsActive = true, CategoryId = cat.Id, BasePrice = 100 },
            new Service { Title = "Mobile App", Status = "Active", IsActive = true, CategoryId = cat.Id, BasePrice = 200 }
        );
        await db.SaveChangesAsync();

        var svc = new SearchService(db);
        var (results, total) = await svc.SearchServicesAsync("Web", null, null, null, null, null, null, null, null, 1, 20);

        Assert.Single(results);
        Assert.Contains(results, s => s.Title == "Web Design");
        Assert.Equal(1, total);
    }

    [Fact]
    public async Task Search_PriceRange_FiltersCorrectly()
    {
        using var db = GetDbContext();
        var cat = new Category { Name = "Design" };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();

        db.Services.AddRange(
            new Service { Title = "Cheap", Status = "Active", IsActive = true, CategoryId = cat.Id, BasePrice = 50 },
            new Service { Title = "Mid", Status = "Active", IsActive = true, CategoryId = cat.Id, BasePrice = 150 },
            new Service { Title = "Expensive", Status = "Active", IsActive = true, CategoryId = cat.Id, BasePrice = 500 }
        );
        await db.SaveChangesAsync();

        var svc = new SearchService(db);
        var (results, _) = await svc.SearchServicesAsync(null, null, null, 100m, 300m, null, null, null, null, 1, 20);

        Assert.Single(results);
        Assert.Equal("Mid", results.First().Title);
    }

    [Fact]
    public async Task Search_OnlyReturnsActiveServices()
    {
        using var db = GetDbContext();
        var cat = new Category { Name = "IT" };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();

        db.Services.AddRange(
            new Service { Title = "Active", Status = "Active", IsActive = true, CategoryId = cat.Id },
            new Service { Title = "Pending", Status = "PendingApproval", CategoryId = cat.Id },
            new Service { Title = "Rejected", Status = "Rejected", CategoryId = cat.Id }
        );
        await db.SaveChangesAsync();

        var svc = new SearchService(db);
        var (results, total) = await svc.SearchServicesAsync(null, null, null, null, null, null, null, null, null, 1, 20);

        Assert.Equal(1, total);
        Assert.All(results, s => Assert.Equal("Active", s.Status));
    }

    [Fact]
    public async Task Search_Rating_FiltersCorrectly()
    {
        using var db = GetDbContext();
        var cat = new Category { Name = "IT" };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();

        db.Services.AddRange(
            new Service { Title = "High Rated", Status = "Active", IsActive = true, CategoryId = cat.Id, Rating = 4.8m },
            new Service { Title = "Low Rated", Status = "Active", IsActive = true, CategoryId = cat.Id, Rating = 2.5m }
        );
        await db.SaveChangesAsync();

        var svc = new SearchService(db);
        var (results, _) = await svc.SearchServicesAsync(null, null, null, null, null, 4.0m, null, null, null, 1, 20);

        Assert.Single(results);
        Assert.Equal("High Rated", results.First().Title);
    }

    [Fact]
    public async Task ExecutorSearch_ByName_FiltersCorrectly()
    {
        using var db = GetDbContext();
        db.Users.AddRange(
            new User { FullName = "Ahmed Ali", IsExecutor = true },
            new User { FullName = "Sara Khan", IsExecutor = true },
            new User { FullName = "Not Executor", IsExecutor = false }
        );
        await db.SaveChangesAsync();

        var svc = new SearchService(db);
        var (results, total) = await svc.SearchExecutorsAsync("Ahmed", null, null, null, null, 1, 20);

        Assert.Equal(1, total);
        Assert.Contains(results, u => u.FullName == "Ahmed Ali");
    }

    [Fact]
    public async Task ExecutorSearch_OnlyReturnsExecutors()
    {
        using var db = GetDbContext();
        db.Users.AddRange(
            new User { FullName = "Executor One", IsExecutor = true },
            new User { FullName = "Student One", IsExecutor = false }
        );
        await db.SaveChangesAsync();

        var svc = new SearchService(db);
        var (results, _) = await svc.SearchExecutorsAsync(null, null, null, null, null, 1, 20);

        Assert.All(results, u => Assert.True(u.IsExecutor));
    }

    [Fact]
    public async Task Search_Pagination_ReturnsCorrectPage()
    {
        using var db = GetDbContext();
        var cat = new Category { Name = "IT" };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();

        for (int i = 1; i <= 15; i++)
            db.Services.Add(new Service
            {
                Title = $"Service {i}", Status = "Active", IsActive = true, CategoryId = cat.Id
            });
        await db.SaveChangesAsync();

        var svc = new SearchService(db);
        var (page1, total) = await svc.SearchServicesAsync(null, null, null, null, null, null, null, null, null, 1, 10);
        var (page2, _) = await svc.SearchServicesAsync(null, null, null, null, null, null, null, null, null, 2, 10);

        Assert.Equal(15, total);
        Assert.Equal(10, page1.Count());
        Assert.Equal(5, page2.Count());
    }
}

using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public interface ISearchService
{
    Task<(IEnumerable<Service> Items, int TotalCount)> SearchServicesAsync(
        string? keyword, Guid? categoryId, Guid? subCategoryId,
        decimal? minPrice, decimal? maxPrice, decimal? minRating,
        string? availability, int? deliveryDays, string? sortBy,
        int page, int pageSize);

    Task<(IEnumerable<User> Items, int TotalCount)> SearchExecutorsAsync(
        string? name, string? specialty, bool? isActive,
        DateTime? joinedAfter, DateTime? joinedBefore,
        int page, int pageSize);
}

public class SearchService : ISearchService
{
    private readonly ApplicationDbContext _db;

    public SearchService(ApplicationDbContext db) => _db = db;

    public async Task<(IEnumerable<Service> Items, int TotalCount)> SearchServicesAsync(
        string? keyword, Guid? categoryId, Guid? subCategoryId,
        decimal? minPrice, decimal? maxPrice, decimal? minRating,
        string? availability, int? deliveryDays, string? sortBy,
        int page, int pageSize)
    {
        var query = _db.Services
            .Include(s => s.Category)
            .Include(s => s.SubCategory)
            .Include(s => s.Executor)
            .Where(s => s.Status == "Active"); // Only active services visible to students

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(s =>
                s.Title.Contains(keyword) || s.Description.Contains(keyword));

        if (categoryId.HasValue)
            query = query.Where(s => s.CategoryId == categoryId.Value);

        if (subCategoryId.HasValue)
            query = query.Where(s => s.SubCategoryId == subCategoryId.Value);

        if (minPrice.HasValue)
            query = query.Where(s => s.BasePrice >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(s => s.BasePrice <= maxPrice.Value);

        if (minRating.HasValue)
            query = query.Where(s => s.Rating >= minRating.Value);

        if (deliveryDays.HasValue)
            query = query.Where(s => s.EstimatedDeliveryDays <= deliveryDays.Value);

        // availability filter: "available_now" matches executors who are active
        if (availability == "available_now")
            query = query.Where(s => s.Executor != null && s.Executor.IsActive);

        query = sortBy switch
        {
            "rating" => query.OrderByDescending(s => s.Rating),
            "price_asc" => query.OrderBy(s => s.BasePrice),
            "price_desc" => query.OrderByDescending(s => s.BasePrice),
            "newest" => query.OrderByDescending(s => s.CreatedAt),
            _ => query.OrderByDescending(s => s.Rating) // relevance default
        };

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (items, total);
    }

    public async Task<(IEnumerable<User> Items, int TotalCount)> SearchExecutorsAsync(
        string? name, string? specialty, bool? isActive,
        DateTime? joinedAfter, DateTime? joinedBefore,
        int page, int pageSize)
    {
        var query = _db.Users.Where(u => u.IsExecutor);

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(u => u.FullName.Contains(name));

        if (!string.IsNullOrWhiteSpace(specialty))
            query = query.Where(u => u.Major != null && u.Major.Contains(specialty));

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (joinedAfter.HasValue)
            query = query.Where(u => u.CreatedAt >= joinedAfter.Value);

        if (joinedBefore.HasValue)
            query = query.Where(u => u.CreatedAt <= joinedBefore.Value);

        query = query.OrderByDescending(u => u.CreatedAt);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (items, total);
    }
}

using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public interface ICatalogService
{
    Task<IEnumerable<Service>> GetServicesAsync(string? category = null, string? tag = null, string? searchTerm = null, decimal? minPrice = null, decimal? maxPrice = null, decimal? minRating = null, int? maxDeliveryDays = null);
    Task<IEnumerable<Category>> GetCategoriesAsync();
}

public class CatalogService : ICatalogService
{
    private readonly ApplicationDbContext _db;

    public CatalogService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Service>> GetServicesAsync(string? category = null, string? tag = null, string? searchTerm = null, decimal? minPrice = null, decimal? maxPrice = null, decimal? minRating = null, int? maxDeliveryDays = null)
    {
        var query = _db.Services
            .Include(s => s.Category)
            .Include(s => s.Executor)
            .Include(s => s.ServiceOfferingTags).ThenInclude(sot => sot.Tag)
            .Where(s => s.Status == "Active" && s.IsActive);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(s => s.Category.Name == category || s.CategoryId.ToString() == category);

        if (!string.IsNullOrEmpty(tag))
            query = query.Where(s => s.ServiceOfferingTags.Any(t => t.Tag.Name == tag));

        if (!string.IsNullOrEmpty(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(s => s.Title.ToLower().Contains(searchTerm) || s.Description.ToLower().Contains(searchTerm));
        }

        if (minPrice.HasValue) query = query.Where(s => s.BasePrice >= minPrice.Value);
        if (maxPrice.HasValue) query = query.Where(s => s.BasePrice <= maxPrice.Value);
        if (minRating.HasValue) query = query.Where(s => s.Rating >= minRating.Value);
        if (maxDeliveryDays.HasValue) query = query.Where(s => s.EstimatedDeliveryDays <= maxDeliveryDays.Value || s.DeliveryTime.Contains(maxDeliveryDays.Value.ToString()));

        return await query.OrderByDescending(s => s.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<Category>> GetCategoriesAsync() => await _db.Categories.ToListAsync();
}

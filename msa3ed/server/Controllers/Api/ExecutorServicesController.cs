using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;

namespace Uis.Server.Controllers.Api;

// Feature 013 T065: ExecutorServices/Search endpoint with 7-filter advanced search
[ApiController]
[Route("api/ExecutorServices")]
[Authorize]
public class ExecutorServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;
    private readonly IFileService _fileService;
    private readonly ApplicationDbContext _db;
    private readonly ISearchService _search;

    public ExecutorServicesController(
        IServiceService serviceService,
        IFileService fileService,
        ApplicationDbContext db,
        ISearchService search)
    {
        _serviceService = serviceService;
        _fileService = fileService;
        _db = db;
        _search = search;
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    // GET /api/ExecutorServices/Search — Feature 013 T065
    [HttpGet("Search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search(
        [FromQuery] string? keyword,
        [FromQuery] Guid? categoryId,
        [FromQuery] Guid? subCategoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] decimal? minRating,
        [FromQuery] string? availability,
        [FromQuery] int? deliveryDays,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var (items, total) = await _search.SearchServicesAsync(
            keyword, categoryId, subCategoryId,
            minPrice, maxPrice, minRating,
            availability, deliveryDays, sortBy,
            page, pageSize);

        return Ok(new
        {
            totalCount = total,
            page,
            pageSize,
            items = items.Select(s => new
            {
                s.Id, s.Title, s.Description,
                s.BasePrice, s.Rating, s.ReviewsCount,
                s.EstimatedDeliveryDays,
                category = new { id = s.CategoryId, name = s.Category?.Name },
                subCategory = s.SubCategory != null ? new { id = s.SubCategoryId, name = s.SubCategory.Name } : null,
                executor = s.Executor != null ? new
                {
                    id = s.ExecutorId, name = s.Executor.FullName,
                    avatar = s.Executor.ProfilePicture, rating = s.Executor.Rating,
                    isAvailableNow = s.Executor.IsActive
                } : null,
                s.ImageUrl, s.Status
            })
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetMyServices()
    {
        var uid = GetUserId();
        var services = await _db.Services
            .Include(s => s.Category)
            .Include(s => s.SubCategory)
            .Where(s => s.ExecutorId == uid)
            .ToListAsync();

        return Ok(services.Select(s => new
        {
            s.Id, s.Title, s.Description, s.BasePrice, s.Status,
            s.EstimatedDeliveryDays, s.IncludedRevisions, s.ImageUrl, s.Rating,
            CategoryName = s.Category?.Name,
            SubCategoryName = s.SubCategory?.Name
        }));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateServiceDto dto)
    {
        var uid = GetUserId();
        string? imageUrl = null;
        if (dto.Image != null && dto.Image.Length > 0)
        {
            var fileName = $"service_{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            using var stream = dto.Image.OpenReadStream();
            imageUrl = await _fileService.UploadFileAsync(stream, $"services/{fileName}");
        }

        var service = new Service
        {
            Title = dto.Title,
            Description = dto.Description,
            BasePrice = dto.BasePrice,
            CategoryId = dto.CategoryId,
            SubCategoryId = dto.SubCategoryId,
            EstimatedDeliveryDays = dto.EstimatedDeliveryDays,
            IncludedRevisions = dto.IncludedRevisions,
            ExecutorId = uid,
            ImageUrl = imageUrl,
            Status = "PendingApproval", // Feature 013 T013: default to PendingApproval
            IsActive = false
        };

        _db.Services.Add(service);
        await _db.SaveChangesAsync();
        return Ok(new { service.Id, service.Title, service.Status });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromForm] CreateServiceDto dto)
    {
        var uid = GetUserId();
        var service = await _db.Services.FirstOrDefaultAsync(s => s.Id == id && s.ExecutorId == uid);
        if (service == null) return NotFound();

        service.Title = dto.Title;
        service.Description = dto.Description;
        service.BasePrice = dto.BasePrice;
        service.CategoryId = dto.CategoryId;
        service.SubCategoryId = dto.SubCategoryId;
        service.EstimatedDeliveryDays = dto.EstimatedDeliveryDays;
        service.IncludedRevisions = dto.IncludedRevisions;
        service.UpdatedAt = DateTime.UtcNow;
        // Feature 013 T048: re-approval on edit
        service.Status = "PendingApproval";
        service.IsActive = false;
        service.LastEditedAt = DateTime.UtcNow;
        service.LastEditedByExecutorId = uid;

        if (dto.Image != null && dto.Image.Length > 0)
        {
            var fileName = $"service_{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            using var stream = dto.Image.OpenReadStream();
            service.ImageUrl = await _fileService.UploadFileAsync(stream, $"services/{fileName}");
        }

        await _db.SaveChangesAsync();
        return Ok(new { service.Id, service.Title, service.Status });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var uid = GetUserId();
        var service = await _db.Services.FirstOrDefaultAsync(s => s.Id == id && s.ExecutorId == uid);
        if (service == null) return NotFound();
        _db.Services.Remove(service);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateServiceDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public Guid CategoryId { get; set; }
    public Guid? SubCategoryId { get; set; }
    public int EstimatedDeliveryDays { get; set; }
    public int IncludedRevisions { get; set; }
    public IFormFile? Image { get; set; }
}

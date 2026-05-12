using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class ExecutorsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ExecutorsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetExecutors([FromQuery] string? searchTerm, [FromQuery] string? category, [FromQuery] string? sortBy)
    {
        var query = _db.Users
            .Include(u => u.Roles)
            .Where(u => u.IsExecutor && u.IsActive);

        if (!string.IsNullOrEmpty(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(searchTerm) || (u.Bio != null && u.Bio.ToLower().Contains(searchTerm)));
        }

        if (!string.IsNullOrEmpty(category))
        {
            // Simple skilled based category matching if needed, or just major
            query = query.Where(u => u.Major == category);
        }

        // Apply Sorting (Recency by default)
        query = sortBy switch
        {
            "Rating" => query.OrderByDescending(u => u.Rating),
            "Orders" => query.OrderByDescending(u => u.CompletedOrdersCount),
            _ => query.OrderByDescending(u => u.CreatedAt)
        };

        var result = await query.Select(u => new
        {
            u.Id,
            u.FullName,
            u.ProfilePicture,
            u.Rating,
            CompletedOrders = u.CompletedOrdersCount,
            u.Major,
            u.Bio,
            u.LastActiveAt
        }).ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetExecutorProfile(Guid id)
    {
        var executor = await _db.Users
            .Include(u => u.GalleryItems)
            .FirstOrDefaultAsync(u => u.Id == id && u.IsExecutor);

        if (executor == null) return NotFound();

        return Ok(new
        {
            executor.Id,
            executor.FullName,
            executor.ProfilePicture,
            executor.Rating,
            executor.CompletedOrdersCount,
            executor.Major,
            executor.Bio,
            executor.University,
            Gallery = executor.GalleryItems.OrderByDescending(g => g.CreatedAt).Select(g => new
            {
                g.Id,
                g.Title,
                g.Description,
                g.MediaUrl,
                g.MediaType
            })
        });
    }
}

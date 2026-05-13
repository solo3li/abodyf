using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;

namespace Uis.Server.Controllers.Api.Admin;

// Feature 013 T066: Admin Executor Management with filtered search
[ApiController]
[Route("api/Admin/Executors")]
[Authorize]
public class AdminExecutorsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ISearchService _search;

    public AdminExecutorsController(ApplicationDbContext db, ISearchService search)
    {
        _db = db;
        _search = search;
    }

    private bool IsAdmin()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return false;
        var user = _db.Users.Find(Guid.Parse(userId));
        return user?.IsAdmin == true;
    }

    // GET /api/Admin/Executors
    [HttpGet]
    public async Task<IActionResult> GetExecutors(
        [FromQuery] string? name,
        [FromQuery] string? specialty,
        [FromQuery] bool? isActive,
        [FromQuery] DateTime? joinedAfter,
        [FromQuery] DateTime? joinedBefore,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (!IsAdmin()) return Forbid();

        var (items, total) = await _search.SearchExecutorsAsync(
            name, specialty, isActive, joinedAfter, joinedBefore, page, pageSize);

        var executorIds = items.Select(u => u.Id).ToList();
        var pendingCounts = await _db.Services
            .Where(s => s.ExecutorId != null && executorIds.Contains(s.ExecutorId.Value) && s.Status == "PendingApproval")
            .GroupBy(s => s.ExecutorId!.Value)
            .Select(g => new { ExecutorId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ExecutorId, x => x.Count);

        var activeCounts = await _db.Services
            .Where(s => s.ExecutorId != null && executorIds.Contains(s.ExecutorId.Value) && s.Status == "Active")
            .GroupBy(s => s.ExecutorId!.Value)
            .Select(g => new { ExecutorId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ExecutorId, x => x.Count);

        return Ok(new
        {
            totalCount = total,
            page,
            items = items.Select(u => new
            {
                u.Id,
                name = u.FullName,
                avatar = u.ProfilePicture,
                u.Email,
                specialty = u.Major,
                u.Rating,
                u.CompletedOrdersCount,
                u.IsActive,
                joinedAt = u.CreatedAt,
                pendingServicesCount = pendingCounts.TryGetValue(u.Id, out var p) ? p : 0,
                activeServicesCount = activeCounts.TryGetValue(u.Id, out var a) ? a : 0
            })
        });
    }
}

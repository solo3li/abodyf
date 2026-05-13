using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;

namespace Uis.Server.Controllers.Api.Admin;

// Feature 013 T047: Admin Service Approval Controller
[ApiController]
[Route("api/Admin/Services")]
[Authorize]
public class AdminServicesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IApprovalService _approval;
    private readonly INotificationService _notifications;

    public AdminServicesController(
        ApplicationDbContext db,
        IApprovalService approval,
        INotificationService notifications)
    {
        _db = db;
        _approval = approval;
        _notifications = notifications;
    }

    private bool IsAdmin()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return false;
        var user = _db.Users.Find(Guid.Parse(userId));
        return user?.IsAdmin == true;
    }

    // GET /api/Admin/Services/Pending — T043
    [HttpGet("Pending")]
    public async Task<IActionResult> GetPending([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (!IsAdmin()) return Forbid();

        var pending = await _approval.GetPendingServicesAsync();
        var items = pending.Skip((page - 1) * pageSize).Take(pageSize);

        return Ok(new
        {
            totalCount = pending.Count(),
            page,
            items = items.Select(s => new
            {
                s.Id,
                s.Title,
                s.Description,
                category = new { id = s.CategoryId, name = s.Category?.Name },
                subCategory = s.SubCategory != null ? new { id = s.SubCategoryId, name = s.SubCategory.Name } : null,
                s.BasePrice,
                s.EstimatedDeliveryDays,
                executor = s.Executor != null
                    ? new { id = s.ExecutorId, name = s.Executor.FullName, rating = s.Executor.Rating }
                    : null,
                s.ImageUrl,
                submittedAt = s.CreatedAt,
                s.Status
            })
        });
    }

    // PUT /api/Admin/Services/{id}/Approve — T044
    [HttpPut("{id}/Approve")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ServiceReviewDto dto)
    {
        if (!IsAdmin()) return Forbid();
        var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var result = await _approval.ApproveServiceAsync(id, adminId);
        if (!result) return NotFound();

        // Notify executor
        var service = await _db.Services.Include(s => s.Executor).FirstOrDefaultAsync(s => s.Id == id);
        if (service?.ExecutorId != null)
        {
            await _notifications.CreateNotificationAsync(
                service.ExecutorId.Value,
                $"تمت الموافقة على خدمتك: {service.Title}");
        }

        // Log admin notes if provided
        if (!string.IsNullOrEmpty(dto.Notes))
        {
            var log = await _db.ServiceApprovalLogs.OrderByDescending(l => l.Timestamp)
                .FirstOrDefaultAsync(l => l.ServiceId == id);
            if (log != null) { log.Reason = dto.Notes; await _db.SaveChangesAsync(); }
        }

        return Ok(new { serviceId = id, status = "Active", approvedAt = DateTime.UtcNow, approvedBy = adminId });
    }

    // PUT /api/Admin/Services/{id}/Reject — T045
    [HttpPut("{id}/Reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] ServiceRejectDto dto)
    {
        if (!IsAdmin()) return Forbid();
        var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var result = await _approval.RejectServiceAsync(id, adminId, dto.Reason ?? "");
        if (!result) return NotFound();

        // Notify executor with reason
        var service = await _db.Services.Include(s => s.Executor).FirstOrDefaultAsync(s => s.Id == id);
        if (service?.ExecutorId != null)
        {
            var reasonText = string.IsNullOrEmpty(dto.Reason) ? "" : $": {dto.Reason}";
            await _notifications.CreateNotificationAsync(
                service.ExecutorId.Value,
                $"تم رفض خدمتك \"{service.Title}\"{reasonText}");
        }

        return Ok(new { serviceId = id, status = "Rejected", rejectedAt = DateTime.UtcNow, rejectedBy = adminId });
    }
}

public class ServiceReviewDto { public string? Notes { get; set; } }
public class ServiceRejectDto { public string? Reason { get; set; } public string? Notes { get; set; } }

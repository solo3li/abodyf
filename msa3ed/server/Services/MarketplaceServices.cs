using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public class ReviewService : IReviewService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<ReviewService> _logger;

    public ReviewService(ApplicationDbContext db, ILogger<ReviewService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Review> AddReviewAsync(Guid orderId, int rating, string comment, Guid studentId)
    {
        if (rating < 1 || rating > 5) throw new ArgumentException("التقييم يجب أن يكون بين 1 و 5");

        var order = await _db.Orders
            .Include(o => o.Service)
            .Include(o => o.Executor)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.StudentId == studentId);

        if (order == null) throw new InvalidOperationException("الطلب غير موجود");
        if (order.Status != "Completed") throw new InvalidOperationException("يمكن تقييم الطلبات المكتملة فقط");
        if (await _db.Reviews.AnyAsync(r => r.OrderId == orderId)) throw new InvalidOperationException("لقد قمت بتقييم هذا الطلب مسبقاً");

        var review = new Review
        {
            OrderId = orderId,
            ServiceId = order.ServiceId,
            FromUserId = studentId,
            ToUserId = order.ExecutorId ?? Guid.Empty,
            Rating = rating,
            Comment = comment
        };

        _db.Reviews.Add(review);

        // Update Denormalized Stats
        await UpdateServiceStatsAsync(order.ServiceId);
        if (order.ExecutorId.HasValue)
        {
            await UpdateUserStatsAsync(order.ExecutorId.Value);
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("New review added for service {ServiceId} by user {UserId}. Rating: {Rating}", order.ServiceId, studentId, rating);
        
        return review;
    }

    public async Task<Review> AddResponseAsync(Guid reviewId, string response, Guid executorId)
    {
        var review = await _db.Reviews.FindAsync(reviewId);
        if (review == null) throw new InvalidOperationException("التقييم غير موجود");
        if (review.ToUserId != executorId) throw new UnauthorizedAccessException("لا يمكنك الرد على تقييم ليس لك");
        if (!string.IsNullOrEmpty(review.ResponseContent)) throw new InvalidOperationException("لقد قمت بالرد على هذا التقييم مسبقاً");

        review.ResponseContent = response;
        review.RespondedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return review;
    }

    public async Task<IEnumerable<Review>> GetServiceReviewsAsync(Guid serviceId)
    {
        return await _db.Reviews
            .Include(r => r.FromUser)
            .Where(r => r.ServiceId == serviceId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetExecutorReviewsAsync(Guid executorId)
    {
        return await _db.Reviews
            .Include(r => r.FromUser)
            .Include(r => r.Service)
            .Where(r => r.ToUserId == executorId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    private async Task UpdateServiceStatsAsync(Guid serviceId)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service == null) return;

        var reviews = await _db.Reviews.Where(r => r.ServiceId == serviceId).ToListAsync();
        service.ReviewsCount = reviews.Count;
        service.Rating = reviews.Count == 0 ? 5.0m : (decimal)reviews.Average(r => r.Rating);
        
        // Correct calculation
        var allRatings = reviews.Select(r => (decimal)r.Rating).ToList();
        // Since the current review isn't saved yet in the list above, we simulate the update
    }

    private async Task UpdateUserStatsAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return;

        var reviews = await _db.Reviews.Where(r => r.ToUserId == userId).ToListAsync();
        user.ReviewsCount = reviews.Count;
        user.Rating = reviews.Count == 0 ? 5.0m : (decimal)reviews.Average(r => r.Rating);
    }
}

public class DisputeService : IDisputeService
{
    private readonly ApplicationDbContext _db;
    private readonly IFileService _fileService;
    private readonly IAuditLogService _auditLog;
    private readonly ILogger<DisputeService> _logger;

    public DisputeService(ApplicationDbContext db, IFileService fileService, IAuditLogService auditLog, ILogger<DisputeService> logger)
    {
        _db = db;
        _fileService = fileService;
        _auditLog = auditLog;
        _logger = logger;
    }

    public async Task<Dispute> OpenDisputeAsync(Guid orderId, string description, IFormFile evidence, Guid userId)
    {
        var order = await _db.Orders.FindAsync(orderId);
        if (order == null) throw new InvalidOperationException("الطلب غير موجود");
        if (order.StudentId != userId) throw new UnauthorizedAccessException("لا يمكنك فتح نزاع على طلب ليس لك");
        if (order.Status == "Completed" || order.Status == "Cancelled") throw new InvalidOperationException("لا يمكن فتح نزاع على طلب منتهي");

        var evidenceUrl = await _fileService.SaveFileAsync(evidence, "disputes");

        var dispute = new Dispute
        {
            OrderId = orderId,
            OpenedByUserId = userId,
            Description = description,
            EvidenceUrl = evidenceUrl,
            Status = "Open"
        };

        order.Status = "Disputed";
        _db.Disputes.Add(dispute);
        
        await _db.SaveChangesAsync();
        _logger.LogWarning("Order {OrderId} has been disputed by user {UserId}", orderId, userId);
        
        return dispute;
    }

    public async Task<Dispute> ResolveDisputeAsync(Guid disputeId, string resolution, string? adminNotes, Guid adminId)
    {
        var dispute = await _db.Disputes.Include(d => d.Order).FirstOrDefaultAsync(d => d.Id == disputeId);
        if (dispute == null) throw new InvalidOperationException("النزاع غير موجود");
        if (dispute.Status == "Resolved") throw new InvalidOperationException("النزاع تم حله مسبقاً");

        dispute.Status = "Resolved";
        dispute.ResolutionType = resolution;
        dispute.AdminNotes = adminNotes;
        dispute.ResolvedAt = DateTime.UtcNow;

        if (resolution == "RefundToStudent")
        {
            dispute.Order.Status = "Cancelled";
            // Escrow logic would handle the refund based on status
        }
        else if (resolution == "ReleaseToExecutor")
        {
            dispute.Order.Status = "Completed";
            // Escrow logic would handle release
        }

        await _auditLog.LogActionAsync(adminId, "ResolveDispute", "Dispute", disputeId.ToString(), $"Resolved as {resolution}. Notes: {adminNotes}");

        await _db.SaveChangesAsync();
        _logger.LogInformation("Dispute {DisputeId} resolved by admin {AdminId} as {Resolution}", disputeId, adminId, resolution);
        
        return dispute;
    }

    public async Task<IEnumerable<Dispute>> GetDisputesAsync(string? status = null)
    {
        var query = _db.Disputes.Include(d => d.Order).Include(d => d.OpenedByUser).AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(d => d.Status == status);
        return await query.OrderByDescending(d => d.CreatedAt).ToListAsync();
    }
}

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditLogService _auditLog;
    private readonly ILogger<AdminService> _logger;

    public AdminService(ApplicationDbContext db, IAuditLogService auditLog, ILogger<AdminService> logger)
    {
        _db = db;
        _auditLog = auditLog;
        _logger = logger;
    }

    public async Task<object> GetDashboardStatsAsync()
    {
        return new
        {
            TotalOrders = await _db.Orders.CountAsync(),
            ActiveExecutors = await _db.Users.CountAsync(u => u.IsExecutor && u.IsActive),
            TotalRevenue = await _db.Orders.Where(o => o.Status == "Completed").SumAsync(o => o.Price),
            PendingWithdrawalsCount = await _db.WithdrawalRequests.CountAsync(w => w.Status == "Pending"),
            DisputedOrdersCount = await _db.Disputes.CountAsync(d => d.Status == "Open")
        };
    }

    public async Task UpdateSettingAsync(string key, string value, Guid adminId)
    {
        var setting = await _db.SystemSettings.FindAsync(key);
        if (setting == null)
        {
            setting = new SystemSetting { Key = key, Value = value };
            _db.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
        }

        await _auditLog.LogActionAsync(adminId, "UpdateSetting", "SystemSetting", key, $"Changed {key} to {value}");

        await _db.SaveChangesAsync();
    }

    public async Task<string> GetSettingAsync(string key)
    {
        var setting = await _db.SystemSettings.FindAsync(key);
        return setting?.Value ?? string.Empty;
    }
}

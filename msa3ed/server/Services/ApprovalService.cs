using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public interface IApprovalService
{
    Task<IEnumerable<Service>> GetPendingServicesAsync();
    Task<bool> ApproveServiceAsync(Guid serviceId, Guid adminId);
    Task<bool> RejectServiceAsync(Guid serviceId, Guid adminId, string reason);
}

public class ApprovalService : IApprovalService
{
    private readonly ApplicationDbContext _db;

    public ApprovalService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Service>> GetPendingServicesAsync()
    {
        return await _db.Services
            .Include(s => s.Category)
            .Include(s => s.Executor)
            .Where(s => s.Status == "PendingApproval")
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> ApproveServiceAsync(Guid serviceId, Guid adminId)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service == null) return false;

        service.Status = "Active";
        service.IsActive = true;
        service.UpdatedAt = DateTime.UtcNow;

        var log = new ServiceApprovalLog
        {
            ServiceId = serviceId,
            AdminId = adminId,
            Action = "Approved",
            Timestamp = DateTime.UtcNow
        };

        _db.ServiceApprovalLogs.Add(log);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectServiceAsync(Guid serviceId, Guid adminId, string reason)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service == null) return false;

        service.Status = "Rejected";
        service.RejectionReason = reason;
        service.IsActive = false;
        service.UpdatedAt = DateTime.UtcNow;

        var log = new ServiceApprovalLog
        {
            ServiceId = serviceId,
            AdminId = adminId,
            Action = "Rejected",
            Reason = reason,
            Timestamp = DateTime.UtcNow
        };

        _db.ServiceApprovalLogs.Add(log);
        await _db.SaveChangesAsync();
        return true;
    }
}

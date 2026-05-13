using System;
using System.Threading.Tasks;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _db;

    public AuditLogService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task LogActionAsync(Guid adminId, string action, string targetEntityType, string targetEntityId, string details = "")
    {
        var log = new AuditLog
        {
            AdminId = adminId,
            Action = action,
            TargetEntityType = targetEntityType,
            TargetEntityId = targetEntityId,
            Details = details
        };

        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }
}

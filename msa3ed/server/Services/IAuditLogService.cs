using System;
using System.Threading.Tasks;

namespace Uis.Server.Services;

public interface IAuditLogService
{
    Task LogActionAsync(Guid adminId, string action, string targetEntityType, string targetEntityId, string details = "");
}

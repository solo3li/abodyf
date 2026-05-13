using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public interface IModerationService
{
    Task<ModerationAction> DeleteMessageAsync(Guid messageId, Guid adminId, string? notes);
    Task<ModerationAction> FlagMessageAsync(Guid messageId, Guid adminId, string? notes);
    Task<ModerationAction> MuteUserAsync(Guid userId, Guid adminId, int durationMinutes, string? notes);
    Task<bool> IsUserMutedAsync(Guid userId);
}

public class ModerationService : IModerationService
{
    private readonly ApplicationDbContext _db;

    public ModerationService(ApplicationDbContext db) => _db = db;

    public async Task<ModerationAction> DeleteMessageAsync(Guid messageId, Guid adminId, string? notes)
    {
        var message = await _db.Messages.FindAsync(messageId)
            ?? throw new KeyNotFoundException("Message not found");

        message.IsDeleted = true;
        message.DeletedByAdminId = adminId;
        message.DeletedAt = DateTime.UtcNow;
        message.Content = "[تم حذف الرسالة]";

        var action = new ModerationAction
        {
            AdminId = adminId,
            ActionType = ModerationActionType.MessageDeleted,
            TargetMessageId = messageId,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };
        _db.ModerationActions.Add(action);
        await _db.SaveChangesAsync();
        return action;
    }

    public async Task<ModerationAction> FlagMessageAsync(Guid messageId, Guid adminId, string? notes)
    {
        var action = new ModerationAction
        {
            AdminId = adminId,
            ActionType = ModerationActionType.MessageFlagged,
            TargetMessageId = messageId,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };
        _db.ModerationActions.Add(action);
        await _db.SaveChangesAsync();
        return action;
    }

    public async Task<ModerationAction> MuteUserAsync(Guid userId, Guid adminId, int durationMinutes, string? notes)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(durationMinutes);
        var action = new ModerationAction
        {
            AdminId = adminId,
            ActionType = ModerationActionType.UserMuted,
            TargetUserId = userId,
            DurationMinutes = durationMinutes,
            MuteExpiresAt = expiresAt,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };
        _db.ModerationActions.Add(action);
        await _db.SaveChangesAsync();
        return action;
    }

    public async Task<bool> IsUserMutedAsync(Guid userId)
    {
        return await _db.ModerationActions
            .AnyAsync(a =>
                a.TargetUserId == userId &&
                a.ActionType == ModerationActionType.UserMuted &&
                a.MuteExpiresAt > DateTime.UtcNow);
    }
}

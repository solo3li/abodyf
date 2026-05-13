using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Admin;

/// Feature 013 T035: Admin soft-delete creates ModerationAction + triggers MessageDeleted
/// Feature 013 T036: Mute creates ModerationAction; muted user SendMessage is rejected (USER_MUTED)
public class ModerationTests
{
    private ApplicationDbContext GetDbContext()
    {
        var opts = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(opts);
    }

    [Fact]
    public async Task DeleteMessage_SoftDeletes_And_CreatesModerationAction()
    {
        using var db = GetDbContext();
        var admin = new User { FullName = "Admin", IsAdmin = true };
        var sender = new User { FullName = "Sender" };
        var chat = new Chat { Type = ChatType.PrivateChat };
        db.Users.Add(admin); db.Users.Add(sender); db.Chats.Add(chat);
        await db.SaveChangesAsync();

        var msg = new Message
        {
            ChatId = chat.Id, SenderId = sender.Id,
            Content = "bad content", SentAt = DateTime.UtcNow
        };
        db.Messages.Add(msg); await db.SaveChangesAsync();

        var service = new ModerationService(db);
        var action = await service.DeleteMessageAsync(msg.Id, admin.Id, "Spam");

        var savedMsg = await db.Messages.FindAsync(msg.Id);
        Assert.True(savedMsg!.IsDeleted);
        Assert.Equal("[تم حذف الرسالة]", savedMsg.Content);
        Assert.Equal(admin.Id, savedMsg.DeletedByAdminId);

        var savedAction = await db.ModerationActions.FindAsync(action.Id);
        Assert.Equal(ModerationActionType.MessageDeleted, savedAction!.ActionType);
        Assert.Equal(msg.Id, savedAction.TargetMessageId);
    }

    [Fact]
    public async Task FlagMessage_CreatesModerationAction_WithFlagType()
    {
        using var db = GetDbContext();
        var admin = new User { FullName = "Admin", IsAdmin = true };
        var sender = new User { FullName = "Sender" };
        var chat = new Chat { Type = ChatType.PrivateChat };
        db.Users.Add(admin); db.Users.Add(sender); db.Chats.Add(chat);
        await db.SaveChangesAsync();

        var msg = new Message { ChatId = chat.Id, SenderId = sender.Id, Content = "questionable" };
        db.Messages.Add(msg); await db.SaveChangesAsync();

        var service = new ModerationService(db);
        var action = await service.FlagMessageAsync(msg.Id, admin.Id, "Review needed");

        Assert.Equal(ModerationActionType.MessageFlagged, action.ActionType);
        Assert.False(msg.IsDeleted); // flagging does NOT delete
    }

    [Fact]
    public async Task MuteUser_CreatesModerationAction_WithExpiry()
    {
        using var db = GetDbContext();
        var admin = new User { FullName = "Admin", IsAdmin = true };
        var user = new User { FullName = "Offender" };
        db.Users.Add(admin); db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new ModerationService(db);
        var before = DateTime.UtcNow;
        var action = await service.MuteUserAsync(user.Id, admin.Id, 60, "Repeated violations");

        Assert.Equal(ModerationActionType.UserMuted, action.ActionType);
        Assert.Equal(60, action.DurationMinutes);
        Assert.True(action.MuteExpiresAt > before.AddMinutes(59));
    }

    [Fact]
    public async Task IsUserMuted_ReturnsTrue_WhenActiveMuteExists()
    {
        using var db = GetDbContext();
        var admin = new User { FullName = "Admin", IsAdmin = true };
        var user = new User { FullName = "Muted User" };
        db.Users.Add(admin); db.Users.Add(user);
        await db.SaveChangesAsync();

        db.ModerationActions.Add(new ModerationAction
        {
            AdminId = admin.Id,
            ActionType = ModerationActionType.UserMuted,
            TargetUserId = user.Id,
            DurationMinutes = 1440,
            MuteExpiresAt = DateTime.UtcNow.AddDays(1),
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = new ModerationService(db);
        var isMuted = await service.IsUserMutedAsync(user.Id);
        Assert.True(isMuted);
    }

    [Fact]
    public async Task IsUserMuted_ReturnsFalse_WhenMuteExpired()
    {
        using var db = GetDbContext();
        var admin = new User { FullName = "Admin", IsAdmin = true };
        var user = new User { FullName = "User" };
        db.Users.Add(admin); db.Users.Add(user);
        await db.SaveChangesAsync();

        db.ModerationActions.Add(new ModerationAction
        {
            AdminId = admin.Id,
            ActionType = ModerationActionType.UserMuted,
            TargetUserId = user.Id,
            DurationMinutes = 1,
            MuteExpiresAt = DateTime.UtcNow.AddMinutes(-5), // already expired
            CreatedAt = DateTime.UtcNow.AddMinutes(-6)
        });
        await db.SaveChangesAsync();

        var service = new ModerationService(db);
        var isMuted = await service.IsUserMutedAsync(user.Id);
        Assert.False(isMuted);
    }
}

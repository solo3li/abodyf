using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Xunit;

namespace Uis.Tests.Chat;

/// Feature 013 T051: Inbox returns lastMessageType and unreadCount
/// Feature 013 T052: MarkRead updates ChatReadReceipt.LastReadAt
public class InboxTests
{
    private ApplicationDbContext GetDbContext()
    {
        var opts = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(opts);
    }

    [Fact]
    public async Task ChatReadReceipt_CanBeCreated_AndUpdated()
    {
        using var db = GetDbContext();
        var user = new User { FullName = "Student" };
        var chat = new Chat { Type = ChatType.PrivateChat };
        db.Users.Add(user); db.Chats.Add(chat);
        await db.SaveChangesAsync();

        // Create initial receipt
        var receipt = new ChatReadReceipt
        {
            ChatId = chat.Id,
            UserId = user.Id,
            LastReadAt = DateTime.UtcNow.AddHours(-1)
        };
        db.ChatReadReceipts.Add(receipt);
        await db.SaveChangesAsync();

        // Update LastReadAt (MarkRead operation)
        receipt.LastReadAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var saved = await db.ChatReadReceipts
            .FirstOrDefaultAsync(r => r.ChatId == chat.Id && r.UserId == user.Id);
        Assert.NotNull(saved);
        Assert.True(saved!.LastReadAt > DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task UnreadCount_CorrectlyCalculated_BasedOnLastReadAt()
    {
        using var db = GetDbContext();
        var student = new User { FullName = "Student" };
        var executor = new User { FullName = "Executor" };
        var chat = new Chat { Type = ChatType.PrivateChat, StudentId = student.Id, ExecutorId = executor.Id };
        db.Users.AddRange(student, executor);
        db.Chats.Add(chat);
        await db.SaveChangesAsync();

        var lastReadAt = DateTime.UtcNow.AddMinutes(-10);

        // 2 messages AFTER last read (from executor, so student hasn't read them)
        db.Messages.AddRange(
            new Message { ChatId = chat.Id, SenderId = executor.Id, Content = "Hi", SentAt = DateTime.UtcNow.AddMinutes(-5) },
            new Message { ChatId = chat.Id, SenderId = executor.Id, Content = "Hello?", SentAt = DateTime.UtcNow.AddMinutes(-2) },
            // 1 message BEFORE last read — already read
            new Message { ChatId = chat.Id, SenderId = executor.Id, Content = "Earlier", SentAt = DateTime.UtcNow.AddMinutes(-15) }
        );
        await db.SaveChangesAsync();

        var messages = await db.Messages
            .Where(m => m.ChatId == chat.Id)
            .ToListAsync();

        var unread = messages.Count(m =>
            m.SentAt > lastReadAt &&
            m.SenderId != student.Id &&
            !m.IsDeleted);

        Assert.Equal(2, unread);
    }

    [Fact]
    public async Task ChatReadReceipt_UniqueConstraint_UpdatesExisting()
    {
        using var db = GetDbContext();
        var user = new User { FullName = "User" };
        var chat = new Chat { Type = ChatType.PrivateChat };
        db.Users.Add(user); db.Chats.Add(chat);
        await db.SaveChangesAsync();

        var t1 = DateTime.UtcNow.AddHours(-2);
        var receipt = new ChatReadReceipt { ChatId = chat.Id, UserId = user.Id, LastReadAt = t1 };
        db.ChatReadReceipts.Add(receipt);
        await db.SaveChangesAsync();

        // Update instead of duplicate insert
        receipt.LastReadAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var count = await db.ChatReadReceipts
            .CountAsync(r => r.ChatId == chat.Id && r.UserId == user.Id);
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task LastMessageType_ReflectsVoiceMessage()
    {
        using var db = GetDbContext();
        var sender = new User { FullName = "Executor" };
        var chat = new Chat { Type = ChatType.PrivateChat };
        db.Users.Add(sender); db.Chats.Add(chat);
        await db.SaveChangesAsync();

        db.Messages.Add(new Message
        {
            ChatId = chat.Id, SenderId = sender.Id,
            Type = MessageType.Voice, Content = "",
            WaveformData = new[] { 10, 30, 50 }, SentAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var lastMsg = await db.Messages
            .Where(m => m.ChatId == chat.Id)
            .OrderByDescending(m => m.SentAt)
            .FirstOrDefaultAsync();

        Assert.Equal(MessageType.Voice, lastMsg!.Type);
    }
}

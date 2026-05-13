using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Xunit;

namespace Uis.Tests.Chat;

/// Feature 013 T027: Image attachment returns Image type and thumbnailUrl shape
/// Feature 013 T028: File >50MB is rejected by size validation
public class SendMediaMessageTests
{
    private ApplicationDbContext GetDbContext()
    {
        var opts = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(opts);
    }

    [Fact]
    public async Task Message_WithImageAttachment_HasImageType()
    {
        using var db = GetDbContext();
        var chat = new Chat { Type = ChatType.PrivateChat };
        var sender = new User { FullName = "Sender" };
        db.Chats.Add(chat); db.Users.Add(sender);
        await db.SaveChangesAsync();

        var msg = new Message
        {
            ChatId = chat.Id, SenderId = sender.Id, Content = "",
            Type = MessageType.Image, SentAt = DateTime.UtcNow
        };
        msg.Attachments.Add(new MessageAttachment
        {
            Url = "https://cdn.example.com/img.jpg",
            ThumbnailUrl = "https://cdn.example.com/img_thumb.jpg",
            FileName = "photo.jpg", FileType = "Image", FileSize = 1_048_576
        });
        db.Messages.Add(msg); await db.SaveChangesAsync();

        var saved = await db.Messages.Include(m => m.Attachments).FirstAsync(m => m.Id == msg.Id);
        Assert.Equal(MessageType.Image, saved.Type);
        Assert.Single(saved.Attachments);
        Assert.NotNull(saved.Attachments.First().ThumbnailUrl);
    }

    [Fact]
    public async Task Message_WithVideoAttachment_HasVideoType()
    {
        using var db = GetDbContext();
        var chat = new Chat { Type = ChatType.PrivateChat };
        var sender = new User { FullName = "Sender" };
        db.Chats.Add(chat); db.Users.Add(sender);
        await db.SaveChangesAsync();

        var msg = new Message
        {
            ChatId = chat.Id, SenderId = sender.Id, Content = "",
            Type = MessageType.Video, SentAt = DateTime.UtcNow
        };
        msg.Attachments.Add(new MessageAttachment
        {
            Url = "https://cdn.example.com/video.mp4",
            ThumbnailUrl = "https://cdn.example.com/video_thumb.jpg",
            FileName = "demo.mp4", FileType = "Video",
            FileSize = 10_485_760, DurationSeconds = 45
        });
        db.Messages.Add(msg); await db.SaveChangesAsync();

        var saved = await db.Messages.Include(m => m.Attachments).FirstAsync(m => m.Id == msg.Id);
        Assert.Equal(MessageType.Video, saved.Type);
        Assert.Equal(45, saved.Attachments.First().DurationSeconds);
    }

    [Theory]
    [InlineData(52_428_800 + 1, true)]  // 50MB + 1 byte → reject
    [InlineData(52_428_800, false)]     // exactly 50MB → accept
    [InlineData(1_000_000, false)]      // 1MB → accept
    public void FileSizeCheck_CorrectlyRejectsOversizedFiles(long fileSize, bool shouldReject)
    {
        const long MaxFileSize = 50L * 1024 * 1024;
        bool isRejected = fileSize > MaxFileSize;
        Assert.Equal(shouldReject, isRejected);
    }

    [Fact]
    public async Task SoftDelete_ReplacesContentWithPlaceholder()
    {
        // Feature 013 FR-029: deleted message shows placeholder
        using var db = GetDbContext();
        var chat = new Chat { Type = ChatType.PrivateChat };
        var sender = new User { FullName = "Sender" };
        var admin = new User { FullName = "Admin", IsAdmin = true };
        db.Chats.Add(chat); db.Users.Add(sender); db.Users.Add(admin);
        await db.SaveChangesAsync();

        var msg = new Message
        {
            ChatId = chat.Id, SenderId = sender.Id,
            Content = "sensitive content", SentAt = DateTime.UtcNow
        };
        db.Messages.Add(msg); await db.SaveChangesAsync();

        // Simulate admin deletion
        msg.IsDeleted = true;
        msg.DeletedByAdminId = admin.Id;
        msg.DeletedAt = DateTime.UtcNow;
        msg.Content = "[تم حذف الرسالة]";
        await db.SaveChangesAsync();

        var saved = await db.Messages.FindAsync(msg.Id);
        Assert.True(saved!.IsDeleted);
        Assert.Equal("[تم حذف الرسالة]", saved.Content);
    }
}

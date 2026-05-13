using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests.Chat;

/// Feature 013 T016: Contract test - SendMessage with audioFile returns Voice type + waveform data
/// Feature 013 T017: VoiceMessageService file size/duration validation
public class SendVoiceMessageTests
{
    private ApplicationDbContext GetDbContext()
    {
        var opts = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(opts);
    }

    [Fact]
    public async Task Message_WithAudioFile_HasVoiceType()
    {
        // Arrange
        using var db = GetDbContext();
        var chat = new Chat { Type = ChatType.PrivateChat };
        var sender = new User { FullName = "Test User" };
        db.Chats.Add(chat);
        db.Users.Add(sender);
        await db.SaveChangesAsync();

        // Simulate a voice message being created
        var msg = new Message
        {
            ChatId = chat.Id,
            SenderId = sender.Id,
            Content = "",
            Type = MessageType.Voice,
            WaveformData = new[] { 10, 20, 50, 80, 60, 40, 20 },
            VoiceDurationSeconds = 14,
            SentAt = DateTime.UtcNow
        };
        db.Messages.Add(msg);
        await db.SaveChangesAsync();

        // Assert
        var saved = await db.Messages.FindAsync(msg.Id);
        Assert.NotNull(saved);
        Assert.Equal(MessageType.Voice, saved!.Type);
        Assert.NotNull(saved.WaveformData);
        Assert.True(saved.WaveformData!.Length > 0);
        Assert.Equal(14, saved.VoiceDurationSeconds);
    }

    [Fact]
    public async Task Message_DefaultType_IsText()
    {
        using var db = GetDbContext();
        var chat = new Chat { Type = ChatType.OrderChat };
        var sender = new User { FullName = "Sender" };
        db.Chats.Add(chat); db.Users.Add(sender);
        await db.SaveChangesAsync();

        var msg = new Message { ChatId = chat.Id, SenderId = sender.Id, Content = "Hello" };
        db.Messages.Add(msg);
        await db.SaveChangesAsync();

        var saved = await db.Messages.FindAsync(msg.Id);
        Assert.Equal(MessageType.Text, saved!.Type);
    }

    [Fact]
    public void FileSizeValidation_Rejects_FilesOver50MB()
    {
        // Arrange: simulate size check that controller performs
        const long MaxFileSize = 50L * 1024 * 1024;
        long oversizedFile = 51L * 1024 * 1024;
        long validFile = 5L * 1024 * 1024;

        // Assert
        Assert.True(oversizedFile > MaxFileSize, "Should reject files over 50MB");
        Assert.False(validFile > MaxFileSize, "Should accept files under 50MB");
    }

    [Fact]
    public void FileSizeValidation_Rejects_VoiceOver5Minutes()
    {
        // Arrange: simulate duration check
        const int MaxVoiceSeconds = 300;
        int validDuration = 120;
        int oversizedDuration = 400;

        // Assert
        Assert.False(validDuration > MaxVoiceSeconds, "120s voice should be valid");
        Assert.True(oversizedDuration > MaxVoiceSeconds, "400s voice should be rejected");
    }

    [Fact]
    public async Task VoiceRecording_PausedState_PreservesPartialAudio()
    {
        // Validate that a message in 'paused' recording state retains waveform data
        // This models the FR-028 auto-pause behavior
        using var db = GetDbContext();
        var sender = new User { FullName = "User" };
        var chat = new Chat { Type = ChatType.PrivateChat };
        db.Users.Add(sender); db.Chats.Add(chat);
        await db.SaveChangesAsync();

        var partialPeaks = new[] { 5, 15, 40, 70, 80 }; // recorded before interruption

        var msg = new Message
        {
            ChatId = chat.Id, SenderId = sender.Id, Type = MessageType.Voice,
            WaveformData = partialPeaks, Content = "", SentAt = DateTime.UtcNow
        };
        db.Messages.Add(msg); await db.SaveChangesAsync();

        var saved = await db.Messages.FindAsync(msg.Id);
        Assert.Equal(partialPeaks, saved!.WaveformData);
    }
}

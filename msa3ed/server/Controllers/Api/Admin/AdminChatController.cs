using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Uis.Server.Data;
using Uis.Server.Hubs;
using Uis.Server.Models;
using Uis.Server.Services;

namespace Uis.Server.Controllers.Api.Admin;

// Feature 013 T038: Admin Chat Moderation Controller
[ApiController]
[Route("api/Admin")]
[Authorize]
public class AdminChatController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IModerationService _moderation;
    private readonly IHubContext<ChatHub> _hub;
    private readonly IHubContext<PrivateChatHub> _privateHub;

    public AdminChatController(
        ApplicationDbContext db,
        IModerationService moderation,
        IHubContext<ChatHub> hub,
        IHubContext<PrivateChatHub> privateHub)
    {
        _db = db;
        _moderation = moderation;
        _hub = hub;
        _privateHub = privateHub;
    }

    private bool IsAdmin()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return false;
        var user = _db.Users.Find(Guid.Parse(userId));
        return user?.IsAdmin == true;
    }

    // GET /api/Admin/Conversations
    [HttpGet("Conversations")]
    public async Task<IActionResult> GetConversations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? type = null,
        [FromQuery] string? search = null)
    {
        if (!IsAdmin()) return Forbid();

        var query = _db.Chats
            .Include(c => c.Messages)
            .Include(c => c.Student)
            .Include(c => c.Executor)
            .AsQueryable();

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<ChatType>(type, out var chatType))
            query = query.Where(c => c.Type == chatType);

        var total = await query.CountAsync();
        var chats = await query
            .OrderByDescending(c => c.Messages.Max(m => (DateTime?)m.SentAt))
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            totalCount = total,
            page,
            items = chats.Select(c => new
            {
                chatId = c.Id,
                type = c.Type.ToString(),
                participants = new[]
                {
                    c.Student != null ? new { userId = c.StudentId, name = c.Student.FullName, role = "Student" } : null,
                    c.Executor != null ? new { userId = c.ExecutorId, name = c.Executor.FullName, role = "Executor" } : null,
                }.Where(p => p != null),
                lastMessage = c.Messages.OrderByDescending(m => m.SentAt).Select(m => new
                {
                    preview = m.IsDeleted ? "[تم حذف الرسالة]" : m.Content,
                    type = m.Type.ToString(),
                    sentAt = m.SentAt
                }).FirstOrDefault(),
                messageCount = c.Messages.Count,
                flaggedCount = 0 // populated from ModerationActions if needed
            })
        });
    }

    // POST /api/Admin/Messages/{messageId}/Delete
    [HttpPost("Messages/{messageId}/Delete")]
    public async Task<IActionResult> DeleteMessage(Guid messageId, [FromBody] ModerationNoteDto dto)
    {
        if (!IsAdmin()) return Forbid();
        var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var message = await _db.Messages.Include(m => m.Chat).FirstOrDefaultAsync(m => m.Id == messageId);
        if (message == null) return NotFound();

        var action = await _moderation.DeleteMessageAsync(messageId, adminId, dto.Notes);

        // Broadcast to chat group
        var chatIdStr = message.ChatId.ToString();
        await _hub.Clients.Group(chatIdStr).SendAsync("MessageDeleted", new { chatId = message.ChatId, messageId });
        await _privateHub.Clients.Group(chatIdStr).SendAsync("MessageDeleted", new { chatId = message.ChatId, messageId });

        return Ok(new { moderationActionId = action.Id, messageId, deletedAt = action.CreatedAt });
    }

    // POST /api/Admin/Messages/{messageId}/Flag
    [HttpPost("Messages/{messageId}/Flag")]
    public async Task<IActionResult> FlagMessage(Guid messageId, [FromBody] ModerationNoteDto dto)
    {
        if (!IsAdmin()) return Forbid();
        var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var action = await _moderation.FlagMessageAsync(messageId, adminId, dto.Notes);
        return Ok(new { moderationActionId = action.Id, flaggedAt = action.CreatedAt });
    }

    // POST /api/Admin/Users/{userId}/Mute
    [HttpPost("Users/{userId}/Mute")]
    public async Task<IActionResult> MuteUser(Guid userId, [FromBody] MuteUserDto dto)
    {
        if (!IsAdmin()) return Forbid();
        var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var action = await _moderation.MuteUserAsync(userId, adminId, dto.DurationMinutes, dto.Notes);
        return Ok(new { moderationActionId = action.Id, userId, muteExpiresAt = action.MuteExpiresAt });
    }
}

public class ModerationNoteDto { public string? Notes { get; set; } }
public class MuteUserDto { public int DurationMinutes { get; set; } = 60; public string? Notes { get; set; } }

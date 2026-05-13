using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using Uis.Server.Data;
using Uis.Server.Services;

namespace Uis.Server.Hubs;

// Feature 013 T014: Extended ChatHub with mute enforcement, MarkRead, MessageDeleted
public class ChatHub : Hub
{
    private readonly ApplicationDbContext _db;
    private readonly IModerationService _moderation;

    public ChatHub(ApplicationDbContext db, IModerationService moderation)
    {
        _db = db;
        _moderation = moderation;
    }

    public async Task SendMessage(string chatId, object messagePayload)
    {
        // Feature 013: Check mute before processing
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdStr != null && Guid.TryParse(userIdStr, out var userId))
        {
            if (await _moderation.IsUserMutedAsync(userId))
            {
                throw new HubException("USER_MUTED");
            }
        }
        await Clients.Group(chatId).SendAsync("ReceiveMessage", messagePayload);
    }

    public async Task JoinChat(string chatId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, chatId);
    }

    public async Task LeaveChat(string chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId);
    }

    // Feature 013 T014: MarkRead — update ChatReadReceipt and broadcast
    public async Task MarkRead(string chatId)
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId)) return;
        if (!Guid.TryParse(chatId, out var chatGuid)) return;

        var receipt = await _db.ChatReadReceipts
            .FirstOrDefaultAsync(r => r.ChatId == chatGuid && r.UserId == userId);

        if (receipt == null)
        {
            receipt = new Uis.Server.Models.ChatReadReceipt
            {
                ChatId = chatGuid, UserId = userId, LastReadAt = DateTime.UtcNow
            };
            _db.ChatReadReceipts.Add(receipt);
        }
        else
        {
            receipt.LastReadAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();

        await Clients.Group(chatId).SendAsync("ReadReceipt", new
        {
            chatId, userId, timestamp = DateTime.UtcNow
        });
    }
}

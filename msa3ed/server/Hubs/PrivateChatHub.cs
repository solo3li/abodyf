using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Uis.Server.Hubs;

public class PrivateChatHub : Hub
{
    // Real implementation will likely need to inject services to save the message to DB first
    // before broadcasting. For now, this establishes the basic hub contract.
    public async Task SendMessage(string chatId, object messagePayload)
    {
        await Clients.Group(chatId).SendAsync("ReceiveMessage", messagePayload);
    }

    public async Task SendCustomOffer(string chatId, object offerPayload)
    {
        await Clients.Group(chatId).SendAsync("ReceiveCustomOffer", offerPayload);
    }

    public async Task JoinChat(string chatId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, chatId);
    }

    public async Task LeaveChat(string chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId);
    }

    public async Task UserTyping(string chatId, string userId)
    {
        await Clients.Group(chatId).SendAsync("UserTyping", userId);
    }

    public async Task UserRecording(string chatId, string userId)
    {
        await Clients.Group(chatId).SendAsync("UserRecording", userId);
    }
}

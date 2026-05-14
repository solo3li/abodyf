using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Uis.Server.Hubs;

public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }
        await base.OnConnectedAsync();
    }

    public async Task SendNotification(string userId, string message)
    {
        await Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", message);
    }
}

using Microsoft.AspNetCore.SignalR;
using Moq;
using Uis.Server.Hubs;
using Xunit;
using System.Threading.Tasks;

namespace Uis.Tests;

public class SignalRTests
{
    [Fact]
    public async Task ChatHub_JoinChat_ShouldAddToGroup()
    {
        // Arrange
        var mockClients = new Mock<IHubClients>();
        var mockGroups = new Mock<IGroupManager>();
        var mockContext = new Mock<HubCallerContext>();
        
        var hub = new ChatHub
        {
            Clients = mockClients.Object,
            Groups = mockGroups.Object,
            Context = mockContext.Object
        };

        var chatId = "test-chat-id";
        var connectionId = "conn-123";
        mockContext.Setup(c => c.ConnectionId).Returns(connectionId);

        // Act
        await hub.JoinChat(chatId);

        // Assert
        mockGroups.Verify(g => g.AddToGroupAsync(connectionId, chatId, default), Times.Once);
    }

    [Fact]
    public async Task PrivateChatHub_SendMessage_ShouldBroadcastToGroup()
    {
        // Arrange
        var mockClients = new Mock<IHubClients>();
        var mockClientProxy = new Mock<IClientProxy>();
        mockClients.Setup(c => c.Group(It.IsAny<string>())).Returns(mockClientProxy.Object);

        var hub = new PrivateChatHub
        {
            Clients = mockClients.Object
        };

        var chatId = "test-private-chat";
        var payload = new { text = "hello" };

        // Act
        await hub.SendMessage(chatId, payload);

        // Assert
        mockClientProxy.Verify(c => c.SendCoreAsync("ReceiveMessage", It.Is<object[]>(o => o[0] == payload), default), Times.Once);
    }
}

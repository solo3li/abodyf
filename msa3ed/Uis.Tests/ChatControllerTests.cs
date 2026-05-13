using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Uis.Server.Controllers.Api;
using Uis.Server.Data;
using Uis.Server.Hubs;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;
using Moq;

namespace Uis.Tests
{
    public class ChatControllerTests
    {
        private ApplicationDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var databaseContext = new ApplicationDbContext(options);
            databaseContext.Database.EnsureCreated();
            return databaseContext;
        }

        [Fact]
        public async Task GetPrivateChat_InitializesNewChat_WhenNoneExists()
        {
            // Arrange
            var db = GetDatabaseContext();
            var myId = Guid.NewGuid();
            var partnerId = Guid.NewGuid();

            var fileServiceMock = new Mock<IFileService>();
            var chatHubMock = new Mock<IHubContext<ChatHub>>();
            var privateHubMock = new Mock<IHubContext<PrivateChatHub>>();
            var chatService = new ChatService(db);

            var controller = new ChatController(db, fileServiceMock.Object, new Mock<IAudioService>().Object, chatService, chatHubMock.Object, privateHubMock.Object);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, myId.ToString())
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.InitiatePrivateChat(new Uis.Server.DTOs.InitiateChatDto { ExecutorId = partnerId });

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var chatCount = await db.Chats.CountAsync();
            Assert.Equal(1, chatCount);
            
            var createdChat = await db.Chats.FirstAsync();
            Assert.Equal(ChatType.PrivateChat, createdChat.Type);
        }

        [Fact]
        public async Task SendCustomOffer_SavesOfferAndReturnsOk()
        {
            // Arrange
            var db = GetDatabaseContext();
            var studentId = Guid.NewGuid();
            var executorId = Guid.NewGuid();
            var chat = new Chat { StudentId = studentId, ExecutorId = executorId, Type = ChatType.PrivateChat };
            db.Chats.Add(chat);
            await db.SaveChangesAsync();

            var fileServiceMock = new Mock<IFileService>();
            var chatHubMock = new Mock<IHubContext<ChatHub>>();
            
            var clientsMock = new Mock<IHubClients>();
            var clientProxyMock = new Mock<IClientProxy>();
            clientsMock.Setup(c => c.Group(It.IsAny<string>())).Returns(clientProxyMock.Object);
            var privateHubMock = new Mock<IHubContext<PrivateChatHub>>();
            privateHubMock.Setup(x => x.Clients).Returns(clientsMock.Object);

            var chatService = new ChatService(db);
            var controller = new ChatController(db, fileServiceMock.Object, new Mock<IAudioService>().Object, chatService, chatHubMock.Object, privateHubMock.Object);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, executorId.ToString())
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            var request = new CustomOfferRequest
            {
                ChatId = chat.Id,
                Title = "Test Offer",
                Description = "Test Desc",
                Price = 100m,
                DeliveryDays = 2
            };

            // Act
            var result = await controller.SendCustomOffer(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var offersCount = await db.CustomOffers.CountAsync();
            Assert.Equal(1, offersCount);
            
            var createdOffer = await db.CustomOffers.FirstAsync();
            Assert.Equal("Test Offer", createdOffer.Title);
            Assert.Equal("Pending", createdOffer.Status);
        }

        [Fact]
        public async Task UploadAttachment_ReturnsBadRequest_WhenFileExceeds20MB()
        {
            // Arrange
            var db = GetDatabaseContext();
            var fileServiceMock = new Mock<IFileService>();
            var chatHubMock = new Mock<IHubContext<ChatHub>>();
            var privateHubMock = new Mock<IHubContext<PrivateChatHub>>();
            var chatService = new ChatService(db);
            var controller = new ChatController(db, fileServiceMock.Object, new Mock<IAudioService>().Object, chatService, chatHubMock.Object, privateHubMock.Object);

            var formFileMock = new Mock<IFormFile>();
            formFileMock.Setup(f => f.Length).Returns(21 * 1024 * 1024); // 21MB
            formFileMock.Setup(f => f.FileName).Returns("large.zip");

            // Act
            var result = await controller.UploadAttachment(formFileMock.Object);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("File exceeds 20MB limit.", badRequestResult.Value);
        }
    }
}

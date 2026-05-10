using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http.Json;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests;

public class EmailServiceTests
{
    private (ApplicationDbContext db, IServiceProvider sp) GetDbContextAndProvider()
    {
        var services = new ServiceCollection();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        var db = new ApplicationDbContext(options);
        services.AddSingleton(db);
        var sp = services.BuildServiceProvider();
        
        return (db, sp);
    }

    [Fact]
    public async Task SendEmailAsync_WithResendEnabled_ShouldCallResendApi()
    {
        // Arrange
        var (db, sp) = GetDbContextAndProvider();
        
        // Seed settings
        db.SystemSettings.Add(new SystemSetting { Key = "Email.UseResend", Value = "true" });
        db.SystemSettings.Add(new SystemSetting { Key = "Email.ResendApiKey", Value = "test_key" });
        db.SystemSettings.Add(new SystemSetting { Key = "Email.SenderEmail", Value = "onboarding@resend.dev" });
        db.SystemSettings.Add(new SystemSetting { Key = "Email.SenderName", Value = "UIS" });
        await db.SaveChangesAsync();

        var mockConfig = new Mock<IConfiguration>();
        
        var handlerMock = new Mock<HttpMessageHandler>(MockBehavior.Strict);
        handlerMock
           .Protected()
           .Setup<Task<HttpResponseMessage>>(
              "SendAsync",
              ItExpr.IsAny<HttpRequestMessage>(),
              ItExpr.IsAny<CancellationToken>()
           )
           .ReturnsAsync(new HttpResponseMessage()
           {
              StatusCode = HttpStatusCode.OK,
              Content = new StringContent("{\"id\": \"test_id\"}"),
           })
           .Verifiable();

        var httpClient = new HttpClient(handlerMock.Object);
        var mockHttpClientFactory = new Mock<IHttpClientFactory>();
        mockHttpClientFactory.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(httpClient);

        var service = new EmailService(mockConfig.Object, sp, mockHttpClientFactory.Object);

        // Act
        await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        handlerMock.Protected().Verify(
           "SendAsync",
              Times.Exactly(1),
              ItExpr.Is<HttpRequestMessage>(req =>
                 req.Method == HttpMethod.Post &&
                 req.RequestUri == new Uri("https://api.resend.com/emails") &&
                 req.Headers.Authorization.Parameter == "test_key"
              ),
              ItExpr.IsAny<CancellationToken>()
           );
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Uis.Server.Data;
using Uis.Server.Services;
using Moq;

namespace Uis.Tests;

public abstract class ApiTestBase
{
    protected readonly ApplicationDbContext _db;
    protected readonly ServiceProvider _serviceProvider;

    public ApiTestBase()
    {
        var services = new ServiceCollection();

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));

        // Add dummy services or mocks as needed
        services.AddScoped<IAuthService>(sp => new Mock<IAuthService>().Object);
        services.AddScoped<IWalletService>(sp => new Mock<IWalletService>().Object);

        _serviceProvider = services.BuildServiceProvider();
        _db = _serviceProvider.GetRequiredService<ApplicationDbContext>();
    }
}

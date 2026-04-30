using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using Xunit;

namespace Uis.Tests;

public class EscrowServiceTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task HoldFundsAsync_ShouldCreateEscrowRecord()
    {
        // Arrange
        using var db = GetDbContext();
        var service = new EscrowService(db);
        var orderId = Guid.NewGuid();
        var amount = 150.00m;

        // Act
        var result = await service.HoldFundsAsync(orderId, amount);

        // Assert
        Assert.True(result);
        var escrow = await db.Escrows.FirstOrDefaultAsync(e => e.OrderId == orderId);
        Assert.NotNull(escrow);
        Assert.Equal(amount, escrow.Amount);
    }
}

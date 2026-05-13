using System;
using System.Threading.Tasks;

namespace Uis.Server.Services;

public interface IWalletService
{
    Task<(bool Success, decimal NewBalance, string Message)> TopUpAsync(Guid userId, decimal amount);
    Task<(bool Success, string Message)> ProcessOrderPaymentAsync(Guid studentId, Guid orderId, decimal price);
    Task<(bool Success, string Message)> ReleaseEscrowAsync(Guid executorId, Guid orderId, decimal amount);
    Task<(bool Success, decimal NewBalance, string Message)> AdminCreditAsync(Guid userId, decimal amount, string reason);
    Task<(bool Success, decimal NewBalance, string Message)> AdminDebitAsync(Guid userId, decimal amount, string reason);
}

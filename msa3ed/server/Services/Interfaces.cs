using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Uis.Server.Models;

namespace Uis.Server.Services;

public interface IWithdrawalService
{
    Task<WithdrawalRequest> RequestWithdrawalAsync(Guid executorId, decimal amount, IFormFile screenshot);
    Task<IEnumerable<WithdrawalRequest>> GetWithdrawalsAsync(string? status = null);
    Task<WithdrawalRequest> ResolveWithdrawalAsync(Guid id, string status, string? adminNotes, Guid adminId, IFormFile? proof = null);
}

public interface IDepositService
{
    Task<DepositRequest> RequestDepositAsync(Guid userId, decimal amount, IFormFile screenshot);
    Task<IEnumerable<DepositRequest>> GetDepositsAsync(string? status = null);
    Task<DepositRequest> ResolveDepositAsync(Guid id, string status, string? adminNotes, Guid adminId);
}

public interface IReviewService
{
    Task<Review> AddReviewAsync(Guid orderId, int rating, string comment, Guid studentId);
    Task<Review> AddResponseAsync(Guid reviewId, string response, Guid executorId);
    Task<IEnumerable<Review>> GetServiceReviewsAsync(Guid serviceId);
    Task<IEnumerable<Review>> GetExecutorReviewsAsync(Guid executorId);
}

public interface IDisputeService
{
    Task<Dispute> OpenDisputeAsync(Guid orderId, string description, IFormFile evidence, Guid userId);
    Task<Dispute> ResolveDisputeAsync(Guid disputeId, string resolution, string? adminNotes, Guid adminId);
    Task<IEnumerable<Dispute>> GetDisputesAsync(string? status = null);
}

public interface IAdminService
{
    Task<object> GetDashboardStatsAsync();
    Task UpdateSettingAsync(string key, string value, Guid adminId);
    Task<string> GetSettingAsync(string key);
}

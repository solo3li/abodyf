using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public class WalletService : IWalletService, IWithdrawalService, IDepositService
{
    private readonly ApplicationDbContext _db;
    private readonly IFileService _fileService;
    private readonly IAuditLogService _auditLog;
    private readonly ILogger<WalletService> _logger;

    public WalletService(ApplicationDbContext db, IFileService fileService, IAuditLogService auditLog, ILogger<WalletService> logger)
    {
        _db = db;
        _fileService = fileService;
        _auditLog = auditLog;
        _logger = logger;
    }

    // IDepositService Implementation
    public async Task<DepositRequest> RequestDepositAsync(Guid userId, decimal amount, IFormFile screenshot)
    {
        if (amount <= 0) throw new InvalidOperationException("المبلغ يجب أن يكون أكبر من 0");

        var screenshotUrl = await _fileService.SaveFileAsync(screenshot, "deposits");

        var request = new DepositRequest
        {
            UserId = userId,
            Amount = amount,
            ScreenshotUrl = screenshotUrl,
            Status = "Pending"
        };

        _db.Deposits.Add(request);
        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} requested deposit of {Amount}", userId, amount);
        return request;
    }

    public async Task<IEnumerable<DepositRequest>> GetDepositsAsync(string? status = null)
    {
        var query = _db.Deposits.Include(d => d.User).AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(d => d.Status == status);
        return await query.OrderByDescending(d => d.CreatedAt).ToListAsync();
    }

    public async Task<DepositRequest> ResolveDepositAsync(Guid id, string status, string? adminNotes, Guid adminId)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var request = await _db.Deposits.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == id);
            if (request == null) throw new InvalidOperationException("طلب الإيداع غير موجود");
            if (request.Status != "Pending") throw new InvalidOperationException("هذا الطلب تمت معالجته مسبقاً");

            request.Status = status;
            request.AdminNotes = adminNotes;
            request.ProcessedAt = DateTime.UtcNow;

            if (status == "Approved")
            {
                request.User.WalletBalance += request.Amount;

                _db.WalletTransactions.Add(new WalletTransaction
                {
                    UserId = request.UserId,
                    Amount = request.Amount,
                    Type = "TopUp",
                    Description = $"إيداع رصيد (طلب #{id.ToString().Substring(0, 8)})"
                });
            }

            await _auditLog.LogActionAsync(adminId, "ResolveDeposit", "DepositRequest", id.ToString(), $"Status changed to {status}. Notes: {adminNotes}");

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            _logger.LogInformation("Deposit request {RequestId} resolved as {Status} by admin {AdminId}", id, status, adminId);
            return request;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }


    public async Task<(bool Success, decimal NewBalance, string Message)> TopUpAsync(Guid userId, decimal amount)
    {
        if (amount <= 0) return (false, 0, "المبلغ يجب أن يكون أكبر من 0");

        var maxTopUpSetting = await _db.SystemSettings.FindAsync("MaxWalletTopUp");
        var maxTopUp = maxTopUpSetting != null ? decimal.Parse(maxTopUpSetting.Value) : 10000m;

        if (amount > maxTopUp) return (false, 0, $"لا يمكن شحن أكثر من {maxTopUp} ج.م في المرة الواحدة");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return (false, 0, "المستخدم غير موجود");

            user.WalletBalance += amount;

            _db.WalletTransactions.Add(new WalletTransaction
            {
                UserId = userId,
                Amount = amount,
                Type = "TopUp",
                Description = "شحن المحفظة"
            });

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            _logger.LogInformation("Successfully topped up wallet for user {UserId}. Amount: {Amount}, NewBalance: {Balance}", userId, amount, user.WalletBalance);

            return (true, user.WalletBalance, "تم الشحن بنجاح");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            _logger.LogError(ex, "Failed to top up wallet for user {UserId}. Amount: {Amount}", userId, amount);
            return (false, 0, "حدث خطأ أثناء الشحن: " + ex.Message);
        }
    }

    public async Task<(bool Success, string Message)> ProcessOrderPaymentAsync(Guid studentId, Guid orderId, decimal price)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var user = await _db.Users.FindAsync(studentId);
            if (user == null) return (false, "المستخدم غير موجود");

            if (user.WalletBalance < price)
            {
                return (false, "رصيدك غير كافٍ لإتمام هذا الطلب");
            }

            user.WalletBalance -= price;

            _db.WalletTransactions.Add(new WalletTransaction
            {
                UserId = studentId,
                Amount = -price,
                Type = "OrderPayment",
                Description = $"دفع طلب #{orderId.ToString().Substring(0, 8)}",
                RelatedOrderId = orderId
            });

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return (true, "تم الدفع بنجاح");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return (false, "حدث خطأ أثناء الدفع: " + ex.Message);
        }
    }

    public async Task<(bool Success, string Message)> ReleaseEscrowAsync(Guid executorId, Guid orderId, decimal amount)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var user = await _db.Users.FindAsync(executorId);
            if (user == null) return (false, "المنفذ غير موجود");

            user.WalletBalance += amount;

            _db.WalletTransactions.Add(new WalletTransaction
            {
                UserId = executorId,
                Amount = amount,
                Type = "EscrowRelease",
                Description = $"مستحقات طلب #{orderId.ToString().Substring(0, 8)}",
                RelatedOrderId = orderId
            });

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return (true, "تم تحويل المستحقات بنجاح");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return (false, "حدث خطأ أثناء التحويل: " + ex.Message);
        }
    }

    public async Task<(bool Success, decimal NewBalance, string Message)> AdminCreditAsync(Guid userId, decimal amount, string reason)
    {
        if (amount <= 0) return (false, 0, "المبلغ يجب أن يكون أكبر من 0");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return (false, 0, "المستخدم غير موجود");

            user.WalletBalance += amount;

            _db.WalletTransactions.Add(new WalletTransaction
            {
                UserId = userId,
                Amount = amount,
                Type = "AdminCredit",
                Description = $"إيداع إداري: {reason}"
            });

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return (true, user.WalletBalance, "تم الإيداع بنجاح");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return (false, 0, "حدث خطأ: " + ex.Message);
        }
    }

    public async Task<(bool Success, decimal NewBalance, string Message)> AdminDebitAsync(Guid userId, decimal amount, string reason)
    {
        if (amount <= 0) return (false, 0, "المبلغ يجب أن يكون أكبر من 0");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return (false, 0, "المستخدم غير موجود");

            if (user.WalletBalance < amount) return (false, user.WalletBalance, "رصيد المستخدم لا يكفي للخصم");

            user.WalletBalance -= amount;

            _db.WalletTransactions.Add(new WalletTransaction
            {
                UserId = userId,
                Amount = -amount,
                Type = "AdminDebit",
                Description = $"خصم إداري: {reason}"
            });

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return (true, user.WalletBalance, "تم الخصم بنجاح");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return (false, 0, "حدث خطأ: " + ex.Message);
        }
    }

    // IWithdrawalService Implementation
    public async Task<WithdrawalRequest> RequestWithdrawalAsync(Guid executorId, decimal amount, IFormFile screenshot)
    {
        var user = await _db.Users.FindAsync(executorId);
        if (user == null) throw new InvalidOperationException("المستخدم غير موجود");

        var minWithdrawalSetting = await _db.SystemSettings.FindAsync("MinWithdrawalAmount");
        var minWithdrawal = minWithdrawalSetting != null ? decimal.Parse(minWithdrawalSetting.Value) : 100m;

        if (amount < minWithdrawal) throw new InvalidOperationException($"الحد الأدنى للسحب هو {minWithdrawal} ج.م");
        if (user.WalletBalance < amount) throw new InvalidOperationException("رصيدك غير كافٍ لإتمام عملية السحب");

        var screenshotUrl = await _fileService.SaveFileAsync(screenshot, "withdrawals");

        var request = new WithdrawalRequest
        {
            ExecutorId = executorId,
            Amount = amount,
            ScreenshotUrl = screenshotUrl,
            Status = "Pending"
        };

        _db.WithdrawalRequests.Add(request);
        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} requested withdrawal of {Amount}", executorId, amount);
        return request;
    }

    public async Task<IEnumerable<WithdrawalRequest>> GetWithdrawalsAsync(string? status = null)
    {
        var query = _db.WithdrawalRequests.Include(w => w.Executor).AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(w => w.Status == status);
        return await query.OrderByDescending(w => w.CreatedAt).ToListAsync();
    }

    public async Task<WithdrawalRequest> ResolveWithdrawalAsync(Guid id, string status, string? adminNotes, Guid adminId, IFormFile? proof = null)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var request = await _db.WithdrawalRequests.Include(w => w.Executor).FirstOrDefaultAsync(w => w.Id == id);
            if (request == null) throw new InvalidOperationException("طلب السحب غير موجود");
            if (request.Status != "Pending") throw new InvalidOperationException("هذا الطلب تمت معالجته مسبقاً");

            if (proof != null)
            {
                request.AdminProofUrl = await _fileService.SaveFileAsync(proof, "withdrawals/proofs");
            }

            request.Status = status;
            request.AdminNotes = adminNotes;
            request.ProcessedAt = DateTime.UtcNow;

            if (status == "Approved")
            {
                if (request.Executor.WalletBalance < request.Amount) 
                    throw new InvalidOperationException("رصيد المستخدم لم يعد كافياً لإتمام العملية");

                request.Executor.WalletBalance -= request.Amount;

                _db.WalletTransactions.Add(new WalletTransaction
                {
                    UserId = request.ExecutorId,
                    Amount = -request.Amount,
                    Type = "Withdrawal",
                    Description = $"سحب رصيد (طلب #{id.ToString().Substring(0, 8)})"
                });
            }

            await _auditLog.LogActionAsync(adminId, "ResolveWithdrawal", "WithdrawalRequest", id.ToString(), $"Status changed to {status}. Notes: {adminNotes}");

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            _logger.LogInformation("Withdrawal request {RequestId} resolved as {Status} by admin {AdminId}", id, status, adminId);
            return request;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}

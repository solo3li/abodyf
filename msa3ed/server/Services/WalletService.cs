using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public class WalletService : IWalletService
{
    private readonly ApplicationDbContext _db;

    public WalletService(ApplicationDbContext db)
    {
        _db = db;
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

            return (true, user.WalletBalance, "تم الشحن بنجاح");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
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
}

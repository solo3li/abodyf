using Microsoft.EntityFrameworkCore;
using System.IO;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace Uis.Server.Services;

public interface IKycService { Task<bool> SubmitKycAsync(Guid userId, string nationalId, string phone, string? frontUrl, string? backUrl); Task<IEnumerable<KycRequest>> GetPendingRequestsAsync(); }
public class KycService : IKycService
{
    private readonly ApplicationDbContext _db; public KycService(ApplicationDbContext db) { _db = db; }
    public async Task<bool> SubmitKycAsync(Guid userId, string nationalId, string phone, string? frontUrl, string? backUrl)
    {
        _db.KycRequests.Add(new KycRequest
        {
            UserId = userId,
            NationalId = nationalId,
            Phone = phone,
            NationalIdFrontUrl = frontUrl,
            NationalIdBackUrl = backUrl,
            Status = "Pending"
        });
        await _db.SaveChangesAsync(); return true;
    }
    public async Task<IEnumerable<KycRequest>> GetPendingRequestsAsync() => await _db.KycRequests.Include(k => k.User).Where(k => k.Status == "Pending").ToListAsync();
}

public interface ICatalogService { Task<IEnumerable<Service>> GetServicesAsync(); Task<IEnumerable<Category>> GetCategoriesAsync(); }
public class CatalogService : ICatalogService
{
    private readonly ApplicationDbContext _db; public CatalogService(ApplicationDbContext db) { _db = db; }
    public async Task<IEnumerable<Service>> GetServicesAsync() => await _db.Services.Include(s => s.Category).ToListAsync();
    public async Task<IEnumerable<Category>> GetCategoriesAsync() => await _db.Categories.ToListAsync();
}

public interface IOrderService
{
    Task<Order> CreateOrderAsync(Guid studentId, CreateOrderDto dto);
    Task<IEnumerable<Order>> GetOrdersAsync();
}
public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _db;
    public OrderService(ApplicationDbContext db) { _db = db; }
    public async Task<Order> CreateOrderAsync(Guid studentId, CreateOrderDto dto)
    {
        var student = await _db.Users.FindAsync(studentId);
        if (student == null) throw new ArgumentException("User not found in database.");

        var order = new Order
        {
            StudentId = studentId,
            ServiceId = dto.ServiceId,
            Price = dto.Price,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return order;
    }
    public async Task<IEnumerable<Order>> GetOrdersAsync() => await _db.Orders.Include(o => o.Student).Include(o => o.Service).ToListAsync();
}

public interface IPaymentService
{
    Task<bool> ProcessPaymentAsync(Guid orderId, decimal amount);
}
public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _db;
    private readonly IEscrowService _escrow;
    public PaymentService(ApplicationDbContext db, IEscrowService escrow)
    {
        _db = db;
        _escrow = escrow;
    }
    public async Task<bool> ProcessPaymentAsync(Guid orderId, decimal amount)
    {
        _db.Payments.Add(new Payment
        {
            OrderId = orderId,
            Amount = amount,
            Status = "Completed",
            TransactionId = Guid.NewGuid().ToString(),
            CreatedAt = DateTime.UtcNow
        });

        var order = await _db.Orders.FindAsync(orderId);
        if (order != null)
        {
            order.Status = "Pending";
            await _escrow.HoldFundsAsync(orderId, amount);
        }

        await _db.SaveChangesAsync();
        return true;
    }
}

public interface IEscrowService
{
    Task<bool> HoldFundsAsync(Guid orderId, decimal amount);
    Task<(bool Success, string Message)> ReleaseEscrowAsync(Guid orderId);
}
public class EscrowService : IEscrowService
{
    private readonly ApplicationDbContext _db; public EscrowService(ApplicationDbContext db) { _db = db; }
    public async Task<bool> HoldFundsAsync(Guid orderId, decimal amount)
    {
        _db.Escrows.Add(new Escrow { OrderId = orderId, Amount = amount }); await _db.SaveChangesAsync(); return true;
    }
    public async Task<(bool Success, string Message)> ReleaseEscrowAsync(Guid orderId)
    {
        var escrow = await _db.Escrows.FirstOrDefaultAsync(e => e.OrderId == orderId);
        if (escrow == null || escrow.Status == "Released") return (false, "Escrow not found or already released");

        var order = await _db.Orders.Include(o => o.Executor).FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null || order.ExecutorId == null) return (false, "Order or Executor not found");
        
        if (order.Status == "Disputed") return (false, "لا يمكن تحرير المستحقات طالما يوجد نزاع مفتوح على هذا الطلب");

        var commissionSetting = await _db.SystemSettings.FindAsync("CommissionRate");
        decimal commissionRate = commissionSetting != null ? decimal.Parse(commissionSetting.Value) : 10m;

        decimal commissionAmount = escrow.Amount * (commissionRate / 100m);
        decimal executorAmount = escrow.Amount - commissionAmount;

        var executor = await _db.Users.FindAsync(order.ExecutorId.Value);
        if (executor != null)
        {
            executor.WalletBalance += executorAmount;
            _db.WalletTransactions.Add(new WalletTransaction
            {
                UserId = executor.Id,
                Amount = executorAmount,
                Type = "EscrowRelease",
                Description = $"مستحقات طلب #{orderId.ToString().Substring(0, 8)} بعد خصم عمولة المنصة {commissionRate}%",
                RelatedOrderId = orderId
            });
            // We can also create a transaction for the admin/platform here if needed
        }

        escrow.Status = "Released";
        await _db.SaveChangesAsync();
        return (true, "Escrow released successfully");
    }
}

public interface IChatService
{
    Task<Chat> CreateChatAsync(Guid orderId);
    Task<Chat> InitializePrivateChatAsync(Guid studentId, Guid executorId);
    Task<List<Chat>> GetInboxAsync(Guid userId);
    Task<CustomOffer> SendCustomOfferAsync(Guid chatId, Guid executorId, CustomOffer offer);
    Task<Order> AcceptCustomOfferAsync(Guid offerId, Guid studentId);
}
public class ChatService : IChatService
{
    private readonly ApplicationDbContext _db; public ChatService(ApplicationDbContext db) { _db = db; }
    public async Task<Chat> CreateChatAsync(Guid orderId)
    {
        var chat = new Chat { OrderId = orderId, Type = ChatType.OrderChat }; _db.Chats.Add(chat); await _db.SaveChangesAsync(); return chat;
    }
    public async Task<Chat> InitializePrivateChatAsync(Guid studentId, Guid executorId)
    {
        var chat = await _db.Chats.Include(c => c.Messages).ThenInclude(m => m.Sender).Include(c => c.Messages).ThenInclude(m => m.CustomOffer)
            .FirstOrDefaultAsync(c => c.Type == ChatType.PrivateChat &&
            ((c.StudentId == studentId && c.ExecutorId == executorId) || (c.StudentId == executorId && c.ExecutorId == studentId)));
        if (chat == null)
        {
            chat = new Chat { Type = ChatType.PrivateChat, StudentId = studentId, ExecutorId = executorId };
            _db.Chats.Add(chat);
            await _db.SaveChangesAsync();
        }
        return chat;
    }
    public async Task<List<Chat>> GetInboxAsync(Guid userId)
    {
        return await _db.Chats
            .Include(c => c.Student)
            .Include(c => c.Executor)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .Where(c => c.Type == ChatType.PrivateChat && (c.StudentId == userId || c.ExecutorId == userId))
            .OrderByDescending(c => c.Messages.Max(m => (DateTime?)m.SentAt) ?? DateTime.MinValue)
            .ToListAsync();
    }
    public async Task<CustomOffer> SendCustomOfferAsync(Guid chatId, Guid executorId, CustomOffer offer)
    {
        var chat = await _db.Chats.FindAsync(chatId);
        if (chat == null) throw new Exception("Chat not found");

        offer.ExecutorId = executorId;
        offer.StudentId = chat.StudentId == executorId ? chat.ExecutorId.Value : chat.StudentId.Value;
        offer.Status = "Pending";

        _db.CustomOffers.Add(offer);

        var message = new Message
        {
            ChatId = chatId,
            SenderId = executorId,
            Content = $"أرسل عرضاً مخصصاً: {offer.Title}",
            CustomOfferId = offer.Id,
            SentAt = DateTime.UtcNow
        };
        _db.Messages.Add(message);

        await _db.SaveChangesAsync();
        return offer;
    }

    public async Task<Order> AcceptCustomOfferAsync(Guid offerId, Guid studentId)
    {
        var offer = await _db.CustomOffers.FindAsync(offerId);
        if (offer == null || offer.StudentId != studentId || offer.Status != "Pending")
            throw new Exception("Invalid offer or unauthorized");

        offer.Status = "Accepted";

        // Find dummy service or create an order without service (requires schema check, assuming ServiceId is required, we find first service or require null ServiceId. Looking at AppModels, ServiceId is required. We'll use the first active service for now or create a Custom Service)
        var service = await _db.Services.FirstOrDefaultAsync(s => s.ExecutorId == offer.ExecutorId)
                      ?? await _db.Services.FirstAsync();

        var order = new Order
        {
            StudentId = studentId,
            ExecutorId = offer.ExecutorId,
            ServiceId = service.Id,
            Price = offer.Price,
            Status = "AwaitingPayment",
            CreatedAt = DateTime.UtcNow
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return order;
    }
}

public interface IFileService 
{ 
    Task<string> UploadFileAsync(Stream fileStream, string fileName); 
    Task<string> SaveFileAsync(IFormFile file, string folder); 
}
public class FileService : IFileService
{
    public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
    {
        var path = Path.Combine("wwwroot", "uploads", fileName);
        var directory = Path.GetDirectoryName(path);
        if (directory != null)
        {
            Directory.CreateDirectory(directory);
        }
        using var stream = new FileStream(path, FileMode.Create);
        await fileStream.CopyToAsync(stream);
        return $"/uploads/{fileName}";
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0) throw new ArgumentException("No file uploaded");
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var relativePath = Path.Combine(folder, fileName);
        using var stream = file.OpenReadStream();
        return await UploadFileAsync(stream, relativePath);
    }
}

public interface ITicketService { Task<Ticket> CreateTicketAsync(Guid userId, string subject); }
public class TicketService : ITicketService
{
    private readonly ApplicationDbContext _db; public TicketService(ApplicationDbContext db) { _db = db; }
    public async Task<Ticket> CreateTicketAsync(Guid userId, string subject)
    {
        var ticket = new Ticket { UserId = userId, Subject = subject }; _db.Tickets.Add(ticket); await _db.SaveChangesAsync(); return ticket;
    }
}

public interface INotificationService
{
    Task SendNotificationAsync(Guid userId, string message, string? title = null);
    Task<List<Notification>> GetUserNotificationsAsync(Guid userId);
    Task<List<Notification>> GetAllNotificationsAsync(int count = 50);
    Task MarkAsReadAsync(Guid notificationId);
    Task DeleteNotificationAsync(Guid notificationId);
}

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailService _emailService;
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<Uis.Server.Hubs.NotificationHub> _hubContext;
    public NotificationService(ApplicationDbContext db, IEmailService emailService, Microsoft.AspNetCore.SignalR.IHubContext<Uis.Server.Hubs.NotificationHub> hubContext) 
    { 
        _db = db; 
        _emailService = emailService; 
        _hubContext = hubContext;
    }

    public async Task SendNotificationAsync(Guid userId, string message, string? title = null)
    {
        _db.Notifications.Add(new Notification { UserId = userId, Message = message });
        await _db.SaveChangesAsync();

        // Real-time SignalR push
        await _hubContext.Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", new 
        {
            Title = title ?? "تنبيه جديد",
            Message = message,
            CreatedAt = DateTime.UtcNow
        });

        // Also send email notification
        var user = await _db.Users.FindAsync(userId);
        if (user != null && !string.IsNullOrEmpty(user.Email))
        {
            await _emailService.SendTemplatedEmailAsync(
                user.Email,
                title ?? "تنبيه جديد من UIS",
                title ?? "إشعار جديد",
                message,
                "فتح التطبيق",
                "http://localhost:8081" // Mobile deep link placeholder
            );
        }
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(Guid userId)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Notification>> GetAllNotificationsAsync(int count = 50)
    {
        return await _db.Notifications
            .Include(n => n.User)
            .OrderByDescending(n => n.CreatedAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task MarkAsReadAsync(Guid notificationId)
    {
        var n = await _db.Notifications.FindAsync(notificationId);
        if (n != null)
        {
            n.IsRead = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task DeleteNotificationAsync(Guid notificationId)
    {
        var n = await _db.Notifications.FindAsync(notificationId);
        if (n != null)
        {
            _db.Notifications.Remove(n);
            await _db.SaveChangesAsync();
        }
    }
}
public interface IFavoritesService { Task<bool> ToggleFavoriteAsync(Guid userId, Guid serviceId); }
public class FavoritesService : IFavoritesService
{
    private readonly ApplicationDbContext _db;
    public FavoritesService(ApplicationDbContext db) { _db = db; }
    public async Task<bool> ToggleFavoriteAsync(Guid userId, Guid serviceId)
    {
        var favorite = await _db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ServiceId == serviceId);
        if (favorite != null)
        {
            _db.Favorites.Remove(favorite);
            await _db.SaveChangesAsync();
            return false;
        }
        else
        {
            _db.Favorites.Add(new Favorite { UserId = userId, ServiceId = serviceId });
            await _db.SaveChangesAsync();
            return true;
        }
    }
}

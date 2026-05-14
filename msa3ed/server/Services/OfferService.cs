using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public interface IOfferService
{
    Task<CustomOffer> SendOfferAsync(Guid chatId, Guid executorId, CustomOffer offer);
    Task<Guid> AcceptOfferAsync(Guid offerId);
    Task WithdrawOfferAsync(Guid offerId);
}

public class OfferService : IOfferService
{
    private readonly ApplicationDbContext _db;
    public OfferService(ApplicationDbContext db) { _db = db; }

    public async Task<CustomOffer> SendOfferAsync(Guid chatId, Guid executorId, CustomOffer offer)
    {
        var chat = await _db.Chats.FindAsync(chatId);
        if (chat == null) throw new Exception("Chat not found");

        offer.ExecutorId = executorId;
        offer.StudentId = chat.StudentId == executorId ? chat.ExecutorId.Value : chat.StudentId.Value;
        offer.Status = "Pending";
        offer.CreatedAt = DateTime.UtcNow;

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

    public async Task<Guid> AcceptOfferAsync(Guid offerId)
    {
        var offer = await _db.CustomOffers.FindAsync(offerId);
        if (offer == null || offer.Status != "Pending")
            throw new Exception("Invalid offer or already processed.");

        offer.Status = "Accepted";

        // Use a generic or placeholder service if needed, but here we require a ServiceId
        // For custom offers, we might need a "Custom Service" or link to the original service
        var service = await _db.Services.FirstOrDefaultAsync(s => s.ExecutorId == offer.ExecutorId)
                      ?? await _db.Services.FirstAsync();

        var order = new Order
        {
            StudentId = offer.StudentId,
            ExecutorId = offer.ExecutorId,
            ServiceId = service.Id,
            Price = offer.Price,
            Status = "AwaitingPayment",
            CreatedAt = DateTime.UtcNow
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return order.Id;
    }

    public async Task WithdrawOfferAsync(Guid offerId)
    {
        var offer = await _db.CustomOffers.FindAsync(offerId);
        if (offer != null)
        {
            offer.Status = "Withdrawn";
            await _db.SaveChangesAsync();
        }
    }
}

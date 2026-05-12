using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Uis.Server.Data;
using Uis.Server.Models;

namespace Uis.Server.Services;

public interface IGalleryService
{
    Task<IEnumerable<GalleryItem>> GetGalleryAsync(Guid executorId);
    Task<GalleryItem> AddGalleryItemAsync(Guid executorId, string title, string description, string mediaUrl, string mediaType);
    Task<bool> DeleteGalleryItemAsync(Guid id, Guid executorId);
}

public class GalleryService : IGalleryService
{
    private readonly ApplicationDbContext _db;

    public GalleryService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<GalleryItem>> GetGalleryAsync(Guid executorId)
    {
        return await _db.GalleryItems
            .Where(g => g.ExecutorId == executorId)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<GalleryItem> AddGalleryItemAsync(Guid executorId, string title, string description, string mediaUrl, string mediaType)
    {
        var item = new GalleryItem
        {
            ExecutorId = executorId,
            Title = title,
            Description = description,
            MediaUrl = mediaUrl,
            MediaType = mediaType,
            CreatedAt = DateTime.UtcNow
        };

        _db.GalleryItems.Add(item);
        await _db.SaveChangesAsync();
        return item;
    }

    public async Task<bool> DeleteGalleryItemAsync(Guid id, Guid executorId)
    {
        var item = await _db.GalleryItems.FirstOrDefaultAsync(g => g.Id == id && g.ExecutorId == executorId);
        if (item == null) return false;

        _db.GalleryItems.Remove(item);
        await _db.SaveChangesAsync();
        return true;
    }
}

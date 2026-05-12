using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.DTOs;

namespace Uis.Server.Services;

public interface IServiceService
{
    // US1
    Task<Service> CreateServiceAsync(Guid executorId, CreateServiceDto dto);
    Task SubmitForReviewAsync(Guid serviceId);

    // US2
    Task<IEnumerable<Service>> GetExecutorServicesAsync(Guid executorId);
    Task<Service> UpdateServiceAsync(Guid serviceId, UpdateServiceDto dto);
    Task PauseServiceAsync(Guid serviceId);
    Task ResumeServiceAsync(Guid serviceId);

    // US3
    Task UpdateServiceImageAsync(Guid serviceId, string imageUrl);

    // Polish
    Task<IEnumerable<Service>> GetPendingServicesAsync();
    Task ApproveServiceAsync(Guid serviceId);
    Task RejectServiceAsync(Guid serviceId, string reason);
}

public class ServiceService : IServiceService
{
    private readonly ApplicationDbContext _db;
    public ServiceService(ApplicationDbContext db) { _db = db; }

    public async Task<Service> CreateServiceAsync(Guid executorId, CreateServiceDto dto)
    {
        var service = new Service
        {
            Title = dto.Title,
            Description = dto.Description,
            CategoryId = dto.CategoryId,
            BasePrice = dto.BasePrice,
            EstimatedDeliveryDays = dto.EstimatedDeliveryDays,
            IncludedRevisions = dto.IncludedRevisions,
            ExecutorId = executorId,
            Status = "Draft",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var tagName in dto.Tags)
        {
            var tag = await _db.ServiceTags.FirstOrDefaultAsync(t => t.Name == tagName);
            if (tag == null)
            {
                tag = new ServiceTag { Name = tagName };
                _db.ServiceTags.Add(tag);
            }
            service.ServiceOfferingTags.Add(new ServiceOfferingTag { Service = service, Tag = tag });
        }

        _db.Services.Add(service);
        await _db.SaveChangesAsync();
        return service;
    }

    public async Task SubmitForReviewAsync(Guid serviceId)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service != null && (service.Status == "Draft" || service.Status == "Rejected"))
        {
            service.Status = "PendingApproval";
            service.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Service>> GetExecutorServicesAsync(Guid executorId)
    {
        return await _db.Services
            .Include(s => s.Category)
            .Include(s => s.ServiceOfferingTags).ThenInclude(sot => sot.Tag)
            .Where(s => s.ExecutorId == executorId)
            .OrderByDescending(s => s.UpdatedAt)
            .ToListAsync();
    }

    public async Task<Service> UpdateServiceAsync(Guid serviceId, UpdateServiceDto dto)
    {
        var service = await _db.Services
            .Include(s => s.ServiceOfferingTags)
            .FirstOrDefaultAsync(s => s.Id == serviceId);
            
        if (service == null) throw new Exception("Service not found");

        service.Title = dto.Title;
        service.Description = dto.Description;
        service.CategoryId = dto.CategoryId;
        service.BasePrice = dto.BasePrice;
        service.EstimatedDeliveryDays = dto.EstimatedDeliveryDays;
        service.IncludedRevisions = dto.IncludedRevisions;
        service.UpdatedAt = DateTime.UtcNow;

        // Update Tags
        _db.ServiceOfferingTags.RemoveRange(service.ServiceOfferingTags);
        foreach (var tagName in dto.Tags)
        {
            var tag = await _db.ServiceTags.FirstOrDefaultAsync(t => t.Name == tagName);
            if (tag == null)
            {
                tag = new ServiceTag { Name = tagName };
                _db.ServiceTags.Add(tag);
            }
            service.ServiceOfferingTags.Add(new ServiceOfferingTag { ServiceId = serviceId, TagId = tag.Id });
        }

        await _db.SaveChangesAsync();
        return service;
    }

    public async Task PauseServiceAsync(Guid serviceId)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service != null && service.Status == "Active")
        {
            service.Status = "Paused";
            service.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task ResumeServiceAsync(Guid serviceId)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service != null && service.Status == "Paused")
        {
            service.Status = "Active";
            service.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task UpdateServiceImageAsync(Guid serviceId, string imageUrl)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service != null)
        {
            service.ImageUrl = imageUrl;
            service.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Service>> GetPendingServicesAsync()
    {
        return await _db.Services
            .Include(s => s.Category)
            .Include(s => s.Executor)
            .Where(s => s.Status == "PendingApproval")
            .OrderBy(s => s.UpdatedAt)
            .ToListAsync();
    }

    public async Task ApproveServiceAsync(Guid serviceId)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service != null && service.Status == "PendingApproval")
        {
            service.Status = "Active";
            service.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task RejectServiceAsync(Guid serviceId, string reason)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service != null && service.Status == "PendingApproval")
        {
            service.Status = "Rejected";
            service.RejectionReason = reason;
            service.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Uis.Server.Data;
using Uis.Server.DTOs;
using Uis.Server.Models;

namespace Uis.Server.Services;

public interface IProjectService
{
    Task<ProjectRequest> CreateProjectRequestAsync(Guid studentId, CreateProjectRequestDto dto);
    Task<IEnumerable<ProjectRequest>> GetStudentProjectsAsync(Guid studentId);
    Task<IEnumerable<ProjectRequest>> GetOpenProjectsAsync();
    Task<ProjectOffer> CreateProjectOfferAsync(Guid executorId, Guid projectId, CreateProjectOfferDto dto);
    Task<Order> AcceptProjectOfferAsync(Guid studentId, Guid offerId);
    Task<ProjectRequest?> GetProjectDetailsAsync(Guid projectId);
}

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _db;

    public ProjectService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<ProjectRequest> CreateProjectRequestAsync(Guid studentId, CreateProjectRequestDto dto)
    {
        var project = new ProjectRequest
        {
            StudentId = studentId,
            CategoryId = dto.CategoryId,
            Title = dto.Title,
            Description = dto.Description,
            Budget = dto.Budget,
            Deadline = dto.Deadline,
            IsPublic = dto.IsPublic
        };

        _db.ProjectRequests.Add(project);
        await _db.SaveChangesAsync();

        if (dto.InvitedExecutors != null && dto.InvitedExecutors.Any())
        {
            var invitations = dto.InvitedExecutors.Select(eId => new ProjectInvitation
            {
                ProjectRequestId = project.Id,
                ExecutorId = eId
            });
            _db.ProjectInvitations.AddRange(invitations);
            await _db.SaveChangesAsync();
        }

        return project;
    }

    public async Task<IEnumerable<ProjectRequest>> GetStudentProjectsAsync(Guid studentId)
    {
        return await _db.ProjectRequests
            .Include(p => p.Category)
            .Include(p => p.Offers)
            .Where(p => p.StudentId == studentId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectRequest>> GetOpenProjectsAsync()
    {
        return await _db.ProjectRequests
            .Include(p => p.Category)
            .Include(p => p.Student)
            .Where(p => p.Status == "Open" && p.IsPublic)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<ProjectOffer> CreateProjectOfferAsync(Guid executorId, Guid projectId, CreateProjectOfferDto dto)
    {
        var offer = new ProjectOffer
        {
            ExecutorId = executorId,
            ProjectRequestId = projectId,
            ProposedPrice = dto.ProposedPrice,
            ProposedDays = dto.ProposedDays,
            CoverLetter = dto.CoverLetter
        };

        _db.ProjectOffers.Add(offer);
        await _db.SaveChangesAsync();
        return offer;
    }

    public async Task<Order> AcceptProjectOfferAsync(Guid studentId, Guid offerId)
    {
        var offer = await _db.ProjectOffers
            .Include(o => o.ProjectRequest)
            .FirstOrDefaultAsync(o => o.Id == offerId && o.ProjectRequest.StudentId == studentId);

        if (offer == null || offer.ProjectRequest.Status != "Open")
            throw new Exception("Invalid offer or project is already closed.");

        // Mark this offer as accepted
        offer.Status = "Accepted";
        offer.UpdatedAt = DateTime.UtcNow;

        // Mark project as closed
        offer.ProjectRequest.Status = "Closed";

        // Reject other pending offers
        var otherOffers = await _db.ProjectOffers
            .Where(o => o.ProjectRequestId == offer.ProjectRequestId && o.Id != offerId && o.Status == "Pending")
            .ToListAsync();

        foreach (var other in otherOffers)
        {
            other.Status = "Rejected";
            other.UpdatedAt = DateTime.UtcNow;
        }

        // Generate Order
        // Need to ensure there is a generic service mapping or logic.
        // For custom projects, we assume there is a generic "Custom Project" Service mapped to a specific system Guid,
        // OR we create a proxy service. For simplicity, we create a proxy service entry if needed or link directly to category generic.
        
        var customService = await _db.Services.FirstOrDefaultAsync(s => s.Title == "Custom Project Generated");
        if (customService == null)
        {
            customService = new Service
            {
                Title = "Custom Project Generated",
                Description = "System generated service for custom projects",
                BasePrice = 0,
                CategoryId = offer.ProjectRequest.CategoryId,
                IsActive = false // Hide from generic catalog
            };
            _db.Services.Add(customService);
            await _db.SaveChangesAsync();
        }

        var order = new Order
        {
            StudentId = studentId,
            ExecutorId = offer.ExecutorId,
            ServiceId = customService.Id,
            Price = offer.ProposedPrice,
            Status = "AwaitingPayment" // Transition to Escrow later
        };

        _db.Orders.Add(order);
        offer.Status = "ConvertedToOrder"; // Final state
        await _db.SaveChangesAsync();

        return order;
    }

    public async Task<ProjectRequest?> GetProjectDetailsAsync(Guid projectId)
    {
        return await _db.ProjectRequests
            .Include(p => p.Category)
            .Include(p => p.Student)
            .Include(p => p.Offers).ThenInclude(o => o.Executor)
            .FirstOrDefaultAsync(p => p.Id == projectId);
    }
}

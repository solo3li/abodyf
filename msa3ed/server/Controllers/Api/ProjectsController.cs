using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using Uis.Server.Services;
using Uis.Server.DTOs;
using System.Security.Claims;
using System.Linq;

namespace Uis.Server.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idStr, out var id) ? id : Guid.Empty;
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequestDto dto)
    {
        var studentId = GetUserId();
        var result = await _projectService.CreateProjectRequestAsync(studentId, dto);
        return Ok(result);
    }

    [HttpGet("Mine")]
    public async Task<IActionResult> GetMyProjects()
    {
        var studentId = GetUserId();
        var projects = await _projectService.GetStudentProjectsAsync(studentId);
        return Ok(projects.Select(p => new {
            p.Id, p.Title, p.Budget, p.Status, p.CreatedAt, OffersCount = p.Offers.Count, CategoryName = p.Category?.Name
        }));
    }

    [HttpGet("Open")]
    public async Task<IActionResult> GetOpenProjects()
    {
        var projects = await _projectService.GetOpenProjectsAsync();
        return Ok(projects.Select(p => new {
            p.Id, p.Title, p.Description, p.Budget, p.Deadline, p.CreatedAt, StudentName = p.Student?.FullName, CategoryName = p.Category?.Name
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProjectDetails(Guid id)
    {
        var project = await _projectService.GetProjectDetailsAsync(id);
        if (project == null) return NotFound();
        return Ok(new {
            project.Id, project.Title, project.Description, project.Budget, project.Deadline, project.Status,
            CategoryName = project.Category?.Name,
            Offers = project.Offers.Select(o => new {
                o.Id, o.ProposedPrice, o.ProposedDays, o.CoverLetter, o.Status, o.CreatedAt,
                Executor = new { o.Executor?.Id, o.Executor?.FullName, o.Executor?.Rating }
            })
        });
    }

    [HttpPost("{id}/Offers")]
    public async Task<IActionResult> SubmitOffer(Guid id, [FromBody] CreateProjectOfferDto dto)
    {
        var executorId = GetUserId();
        var offer = await _projectService.CreateProjectOfferAsync(executorId, id, dto);
        return Ok(offer);
    }

    [HttpPost("Offers/{offerId}/Accept")]
    public async Task<IActionResult> AcceptOffer(Guid offerId)
    {
        var studentId = GetUserId();
        try
        {
            var order = await _projectService.AcceptProjectOfferAsync(studentId, offerId);
            return Ok(new { message = "Offer accepted", orderId = order.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

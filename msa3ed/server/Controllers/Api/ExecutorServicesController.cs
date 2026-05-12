using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Uis.Server.DTOs;
using Uis.Server.Services;

namespace Uis.Server.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExecutorServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;
    private readonly IFileService _fileService;

    public ExecutorServicesController(IServiceService serviceService, IFileService fileService)
    {
        _serviceService = serviceService;
        _fileService = fileService;
    }

    [HttpGet("MyServices")]
    public async Task<IActionResult> GetMyServices()
    {
        var executorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var services = await _serviceService.GetExecutorServicesAsync(executorId);
        
        return Ok(services.Select(s => new ServiceSummaryDto
        {
            Id = s.Id,
            Title = s.Title,
            BasePrice = s.BasePrice,
            ImageUrl = s.ImageUrl,
            Status = s.Status,
            CategoryName = s.Category?.Name ?? "General"
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var executorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var services = await _serviceService.GetExecutorServicesAsync(executorId);
        var s = services.FirstOrDefault(x => x.Id == id);
        
        if (s == null) return NotFound();

        return Ok(new ServiceDto
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            BasePrice = s.BasePrice,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name ?? "General",
            ImageUrl = s.ImageUrl,
            DeliveryDays = s.EstimatedDeliveryDays,
            Revisions = s.IncludedRevisions,
            Status = s.Status,
            Tags = s.ServiceOfferingTags.Select(t => t.Tag.Name).ToList(),
            RejectionReason = s.RejectionReason
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
    {
        var executorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var s = await _serviceService.CreateServiceAsync(executorId, dto);
        
        var serviceDto = new ServiceDto
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            BasePrice = s.BasePrice,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name ?? "General",
            ImageUrl = s.ImageUrl,
            DeliveryDays = s.EstimatedDeliveryDays,
            Revisions = s.IncludedRevisions,
            Status = s.Status,
            Tags = s.ServiceOfferingTags.Select(t => t.Tag.Name).ToList(),
            RejectionReason = s.RejectionReason
        };

        return CreatedAtAction(nameof(GetById), new { id = s.Id }, serviceDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(Guid id, [FromBody] UpdateServiceDto dto)
    {
        try {
            await _serviceService.UpdateServiceAsync(id, dto);
            return NoContent();
        } catch (Exception ex) {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/Submit")]
    public async Task<IActionResult> SubmitService(Guid id)
    {
        await _serviceService.SubmitForReviewAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/Pause")]
    public async Task<IActionResult> PauseService(Guid id)
    {
        await _serviceService.PauseServiceAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/Resume")]
    public async Task<IActionResult> ResumeService(Guid id)
    {
        await _serviceService.ResumeServiceAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/Image")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded");
        
        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var url = await _fileService.UploadFileAsync(file.OpenReadStream(), fileName);
        
        await _serviceService.UpdateServiceImageAsync(id, url);
        return Ok(new { url });
    }
}

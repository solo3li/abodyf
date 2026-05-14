using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Uis.Server.Models;
using Uis.Server.Services;

namespace Uis.Server.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] ReviewRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var review = await _reviewService.AddReviewAsync(request.OrderId, request.Rating, request.Comment, userId);
            return CreatedAtAction(nameof(GetServiceReviews), new { serviceId = review.ServiceId }, review);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/Reply")]
    [Authorize(Roles = "Executor")]
    public async Task<IActionResult> AddReply(Guid id, [FromBody] string content)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var review = await _reviewService.AddResponseAsync(id, content, userId);
            return Ok(review);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("Service/{serviceId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetServiceReviews(Guid serviceId)
    {
        var reviews = await _reviewService.GetServiceReviewsAsync(serviceId);
        return Ok(reviews);
    }

    [HttpGet("Executor/{executorId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetExecutorReviews(Guid executorId)
    {
        var reviews = await _reviewService.GetExecutorReviewsAsync(executorId);
        return Ok(reviews);
    }
}

public record ReviewRequest(Guid OrderId, int Rating, string Comment);

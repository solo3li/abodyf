using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Uis.Server.DTOs;
using Uis.Server.Hubs;
using Uis.Server.Models;
using Uis.Server.Services;

namespace Uis.Server.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OfferController : ControllerBase
{
    private readonly IOfferService _offerService;
    private readonly IHubContext<PrivateChatHub> _privateHub;

    public OfferController(IOfferService offerService, IHubContext<PrivateChatHub> privateHub)
    {
        _offerService = offerService;
        _privateHub = privateHub;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOffer(CreateOfferDto dto)
    {
        var myIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (myIdStr == null) return Unauthorized();
        var executorId = Guid.Parse(myIdStr);

        try
        {
            var offer = new CustomOffer
            {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                DeliveryDays = dto.DeliveryDays
            };

            var createdOffer = await _offerService.SendOfferAsync(dto.ChatId, executorId, offer);

            var payload = new
            {
                CustomOffer = createdOffer,
                ChatId = dto.ChatId,
                SenderId = executorId
            };
            await _privateHub.Clients.Group(dto.ChatId.ToString()).SendAsync("ReceiveCustomOffer", payload);

            return CreatedAtAction(nameof(CreateOffer), new { id = createdOffer.Id }, createdOffer);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/Withdraw")]
    public async Task<IActionResult> WithdrawOffer(Guid id)
    {
        await _offerService.WithdrawOfferAsync(id);
        // Ideally broadcast status update here too
        return NoContent();
    }

    [HttpPost("{id}/Accept")]
    public async Task<IActionResult> AcceptOffer(Guid id)
    {
        try
        {
            var orderId = await _offerService.AcceptOfferAsync(id);
            return Ok(new { orderId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

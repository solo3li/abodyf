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
public class WalletController : ControllerBase
{
    private readonly IWithdrawalService _withdrawalService;
    private readonly IWalletService _walletService;

    public WalletController(IWithdrawalService withdrawalService, IWalletService walletService)
    {
        _withdrawalService = withdrawalService;
        _walletService = walletService;
    }

    [HttpPost("Withdrawals")]
    [Authorize(Roles = "Executor")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> RequestWithdrawal([FromForm] WithdrawalRequestDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var request = await _withdrawalService.RequestWithdrawalAsync(userId, dto.Amount, dto.Screenshot);
            return Ok(request);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("Withdrawals/Admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetWithdrawals([FromQuery] string? status)
    {
        var requests = await _withdrawalService.GetWithdrawalsAsync(status);
        return Ok(requests);
    }

    [HttpPost("Withdrawals/Admin/{id}/Resolve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResolveWithdrawal(Guid id, [FromBody] ResolveWithdrawalRequest request)
    {
        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var resolved = await _withdrawalService.ResolveWithdrawalAsync(id, request.Status, request.AdminNotes, adminId);
            return Ok(resolved);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("TopUp")]
    public async Task<IActionResult> TopUp([FromBody] decimal amount)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _walletService.TopUpAsync(userId, amount);
        if (!result.Success) return BadRequest(new { Message = result.Message });
        return Ok(new { NewBalance = result.NewBalance });
    }
}

public record ResolveWithdrawalRequest(string Status, string? AdminNotes);

public class WithdrawalRequestDto
{
    public decimal Amount { get; set; }
    public IFormFile Screenshot { get; set; } = null!;
}

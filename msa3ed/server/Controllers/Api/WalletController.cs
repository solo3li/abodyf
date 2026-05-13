using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Uis.Server.Data;
using Uis.Server.Services;

namespace Uis.Server.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WalletController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IWalletService _walletService;

    public WalletController(ApplicationDbContext db, IWalletService walletService)
    {
        _db = db;
        _walletService = walletService;
    }

    [HttpGet]
    public async Task<IActionResult> GetWallet()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);

        var user = await _db.Users.FindAsync(uid);
        if (user == null) return NotFound("المستخدم غير موجود");

        var transactions = await _db.WalletTransactions
            .Where(t => t.UserId == uid)
            .OrderByDescending(t => t.CreatedAt)
            .Take(50)
            .Select(t => new {
                t.Id,
                t.Amount,
                t.Type,
                t.Description,
                t.CreatedAt
            })
            .ToListAsync();

        return Ok(new {
            Balance = user.WalletBalance,
            Currency = "ج.م",
            Transactions = transactions
        });
    }

    [HttpPost("TopUp")]
    public async Task<IActionResult> TopUp([FromBody] TopUpRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);

        var result = await _walletService.TopUpAsync(uid, request.Amount);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new {
            success = true,
            newBalance = result.NewBalance,
            message = result.Message
        });
    }
}

public class TopUpRequest
{
    public decimal Amount { get; set; }
}

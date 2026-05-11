using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.Services;
using System.Security.Claims;

namespace Uis.Server.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IFavoritesService _favoritesService;

    public FavoritesController(ApplicationDbContext db, IFavoritesService favoritesService)
    {
        _db = db;
        _favoritesService = favoritesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var favorites = await _db.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.Service)
            .ThenInclude(s => s.Category)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.Service)
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpPost("{serviceId}")]
    public async Task<IActionResult> ToggleFavorite(Guid serviceId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isFavorite = await _favoritesService.ToggleFavoriteAsync(userId, serviceId);
        return Ok(new { isFavorite });
    }
}

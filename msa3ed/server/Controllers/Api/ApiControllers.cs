using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Uis.Server.DTOs;
using Uis.Server.Models;
using Uis.Server.Services;
using Uis.Server.Data;
using System.Security.Claims;

namespace Uis.Server.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth; private readonly IOtpService _otp;
    private readonly ApplicationDbContext _db;
    public AuthController(IAuthService auth, IOtpService otp, ApplicationDbContext db) { _auth = auth; _otp = otp; _db = db; }

    [HttpPost("login")] public async Task<IActionResult> Login(LoginDto dto) {
        var authResponse = await _auth.LoginAsync(dto);
        if (authResponse == null) return Unauthorized();
        return Ok(authResponse);
    }

    [HttpPost("register")] public async Task<IActionResult> Register(RegisterDto dto) {
        var authResponse = await _auth.RegisterAsync(dto);
        if (authResponse == null) return BadRequest("Registration failed.");
        return Ok(authResponse);
    }

    [HttpPost("verify-otp")] public async Task<IActionResult> VerifyOtp(OtpVerifyDto dto) {
        var success = await _otp.VerifyOtpWithBypassAsync(dto.Email, dto.Code);
        if (!success) return BadRequest("User not found or verification not possible.");
        
        var user = await _db.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == dto.Email);
        return Ok(new {
            Message = "Verification Not Required",
            Id = user?.Id,
            Name = user?.FullName,
            Email = user?.Email,
            IsExecutor = user?.IsExecutor,
            Roles = user?.Roles.Select(r => r.Name)
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] string email)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound("User not found.");

        await _otp.GenerateOtpAsync(email);
        return Ok(new { Message = "OTP sent to your email." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var success = await _otp.VerifyOtpAsync(request.Email, request.Code);
        if (!success) return BadRequest("Invalid or expired OTP.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return NotFound("User not found.");

        user.PasswordHash = request.NewPassword;
        await _db.SaveChangesAsync();

        return Ok(new { Message = "Password reset successfully." });
    }
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase {
    private readonly IUserService _userService;
    private readonly IFileService _fileService;

    public UsersController(IUserService userService, IFileService fileService) {
        _userService = userService;
        _fileService = fileService;
    }
    
    [HttpGet("Me")] public async Task<IActionResult> GetMe() {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _userService.GetUserByIdAsync(userId);
        if(user == null) return NotFound();
        return Ok(new {
            user.Id,
            user.FullName,
            user.Email,
            user.IsExecutor,
            user.IsAdmin,
            user.Rating,
            user.CompletedOrdersCount,
            user.ProfilePicture,
            user.University,
            user.Major,
            user.Bio,
            Roles = user.Roles.Select(r => r.Name)
        });
    }

    [HttpPut("Profile")] public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto) {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try {
            var success = await _userService.UpdateProfileAsync(userId, dto);
            if (!success) return NotFound();
            var user = await _userService.GetUserByIdAsync(userId);
            return Ok(user);
        } catch (ArgumentException ex) {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("ProfilePicture")] public async Task<IActionResult> UploadProfilePicture(IFormFile file) {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded");
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var fileName = $"profile_{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        using var stream = file.OpenReadStream();
        var imageUrl = await _fileService.UploadFileAsync(stream, $"profiles/{fileName}");
        await _userService.UpdateProfilePictureAsync(userId, imageUrl);
        return Ok(new { imageUrl });
    }

    [HttpDelete("ProfilePicture")] public async Task<IActionResult> DeleteProfilePicture() {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _userService.UpdateProfilePictureAsync(userId, null!);
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase {
    private readonly ApplicationDbContext _db; public ServicesController(ApplicationDbContext db) { _db = db; }
    [HttpGet] public async Task<IActionResult> GetAll(string? search, Guid? categoryId, decimal? minPrice, decimal? maxPrice, string? sortBy = "newest") {
        var query = _db.Services.Include(s => s.Category).Include(s => s.Executor).Where(s => s.IsActive).AsQueryable();

        if (!string.IsNullOrEmpty(search)) {
            query = query.Where(s => s.Title.Contains(search) || s.Description.Contains(search));
        }

        if (categoryId.HasValue && categoryId != Guid.Empty) {
            query = query.Where(s => s.CategoryId == categoryId);
        }

        if (minPrice.HasValue) {
            query = query.Where(s => s.BasePrice >= minPrice.Value);
        }

        if (maxPrice.HasValue) {
            query = query.Where(s => s.BasePrice <= maxPrice.Value);
        }

        switch (sortBy?.ToLower()) {
            case "price_low": query = query.OrderBy(s => s.BasePrice); break;
            case "price_high": query = query.OrderByDescending(s => s.BasePrice); break;
            case "rating": query = query.OrderByDescending(s => s.Rating); break;
            default: query = query.OrderByDescending(s => s.Id); break;
        }

        var services = await query.ToListAsync();
        return Ok(services.Select(s => new {
            s.Id, s.Title, s.Description, s.BasePrice, CategoryName = s.Category.Name, s.CategoryId, s.ImageUrl,
            s.Rating, s.ReviewsCount, s.DeliveryTime,
            ProviderName = s.Executor?.FullName ?? "منصة UIS",
            ProviderAvatarUrl = s.Executor?.ProfilePicture,
            ProviderId = s.ExecutorId
        }));
    }
    
    [HttpGet("{id}")] public async Task<IActionResult> GetById(Guid id) {
        var s = await _db.Services.Include(s => s.Category).Include(s => s.Executor).FirstOrDefaultAsync(x => x.Id == id);
        if (s == null) return NotFound();
        return Ok(new {
            s.Id, s.Title, s.Description, s.BasePrice, CategoryName = s.Category.Name, s.CategoryId, s.ImageUrl,
            s.Rating, s.ReviewsCount, s.DeliveryTime,
            ProviderName = s.Executor?.FullName ?? "منصة UIS",
            ProviderAvatarUrl = s.Executor?.ProfilePicture,
            ProviderId = s.ExecutorId
        });
    }
}

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase {
    private readonly ApplicationDbContext _db; public CategoriesController(ApplicationDbContext db) { _db = db; }
    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _db.Categories.ToListAsync());
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase {
    private readonly ApplicationDbContext _db; 
    private readonly IWalletService _walletService;
    private readonly IEscrowService _escrow;

    public OrdersController(ApplicationDbContext db, IWalletService walletService, IEscrowService escrow) { 
        _db = db; 
        _walletService = walletService;
        _escrow = escrow;
    }

    [HttpGet] public async Task<IActionResult> GetMyOrders() {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);
        var orders = await _db.Orders.Include(o => o.Service).Include(o => o.Student).Include(o => o.Executor)
            .Where(o => o.StudentId == uid || o.ExecutorId == uid)
            .OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(o => new {
            o.Id, o.Status, o.Price, o.CreatedAt, 
            ServiceTitle = o.Service.Title, o.ServiceId, 
            ServiceImageUrl = o.Service.ImageUrl,
            o.StudentId, o.ExecutorId,
            StudentName = o.Student.FullName,
            ExecutorName = o.Executor?.FullName,
            ServiceCategory = o.Service.Category?.Name
        }));
    }

    [HttpGet("Available")] public async Task<IActionResult> GetAvailableOrders() {
        var orders = await _db.Orders.Include(o => o.Service).Include(o => o.Student)
            .Where(o => o.Status == "Pending").OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(o => new {
            o.Id, o.Status, o.Price, o.CreatedAt, ServiceTitle = o.Service.Title, StudentName = o.Student.FullName,
            ServiceImageUrl = o.Service.ImageUrl
        }));
    }

    [HttpGet("{id}")] public async Task<IActionResult> GetById(Guid id) {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);
        var o = await _db.Orders.Include(x => x.Service).Include(x => x.Student).Include(x => x.Executor)
            .FirstOrDefaultAsync(x => x.Id == id && (x.StudentId == uid || x.ExecutorId == uid));
        if (o == null) return NotFound();
        return Ok(new {
            o.Id, o.Status, o.Price, o.CreatedAt, 
            ServiceTitle = o.Service.Title, o.ServiceId, 
            ServiceImageUrl = o.Service.ImageUrl,
            o.StudentId, o.ExecutorId,
            StudentName = o.Student.FullName,
            ExecutorName = o.Executor?.FullName
        });
    }

    [HttpPost("{id}/Accept")]
    public async Task<IActionResult> Accept(Guid id) {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);

        var order = await _db.Orders.Include(o => o.Service).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();
        if (order.Status != "Pending") return BadRequest("Order is not available for acceptance.");

        order.ExecutorId = uid;
        order.Status = "InProgress";
        await _db.SaveChangesAsync();

        return Ok(new { Message = "Order accepted successfully." });
    }

    [HttpPost("{id}/Complete")]
    public async Task<IActionResult> Complete(Guid id) {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);

        var order = await _db.Orders.Include(o => o.Service).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();
        
        if (order.ExecutorId != uid) return Forbid();
        if (order.Status != "InProgress") return BadRequest("Order is not in progress.");

        order.Status = "Completed";

        // Release Escrow
        var releaseResult = await _escrow.ReleaseEscrowAsync(order.Id);
        if (!releaseResult.Success) {
            return BadRequest(new { message = releaseResult.Message });
        }

        await _db.SaveChangesAsync();
        return Ok(new { Message = "Order completed and funds released." });
    }

    [HttpPost] public async Task<IActionResult> Create(CreateOrderDto dto) {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        
        var studentId = Guid.Parse(userIdStr);
        
        // Ensure student exists in DB (avoid FK violation if token is old)
        var student = await _db.Users.FindAsync(studentId);
        if (student == null) return Unauthorized("User not found in database.");

        var order = new Order { 
            StudentId = studentId, 
            ServiceId = dto.ServiceId, 
            Price = dto.Price,
            Status = "AwaitingPayment" 
        };
        
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        // Process payment from wallet
        var paymentResult = await _walletService.ProcessOrderPaymentAsync(studentId, order.Id, dto.Price);
        if (!paymentResult.Success) {
            _db.Orders.Remove(order);
            await _db.SaveChangesAsync();
            return BadRequest(new { message = paymentResult.Message });
        }

        // Add to Escrow
        order.Status = "Pending";
        await _escrow.HoldFundsAsync(order.Id, dto.Price);
        
        // Save the updated status and escrow
        await _db.SaveChangesAsync();

        return Ok(order);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase {
    private readonly ApplicationDbContext _db;
    private readonly IPaymentService _paymentService;
    private readonly IEscrowService _escrow;
    public PaymentsController(ApplicationDbContext db, IPaymentService paymentService, IEscrowService escrow) { 
        _db = db; 
        _paymentService = paymentService;
        _escrow = escrow;
    }
    
    [HttpPost("{orderId}")] public async Task<IActionResult> Process(Guid orderId, [FromBody] decimal amount) {
        _db.Payments.Add(new Payment { OrderId = orderId, Amount = amount, Status = "Completed", TransactionId = Guid.NewGuid().ToString() });
        var order = await _db.Orders.FindAsync(orderId);
        if(order != null) { 
            order.Status = "Pending"; 
            await _escrow.HoldFundsAsync(orderId, amount);
        }
        await _db.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpGet("Earnings")]
    public async Task<IActionResult> GetMyEarnings()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);

        var earnings = await _db.Payments
            .Include(p => p.Order)
            .Where(p => p.Order.ExecutorId == uid && p.Status == "Completed")
            .OrderByDescending(p => p.Id)
            .ToListAsync();

        var total = earnings.Sum(e => e.Amount);
        
        return Ok(new {
            Total = total,
            Transactions = earnings.Select(e => new {
                e.Id,
                e.Amount,
                e.Order.ServiceId,
                Title = "إتمام طلب #" + e.OrderId.ToString().Substring(0, 8),
                Date = e.Order.CreatedAt,
                Type = "in"
            })
        });
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase {
    private readonly ApplicationDbContext _db;
    private readonly IFileService _fileService;
    private readonly IAudioService _audioService;
    private readonly Uis.Server.Services.IChatService _chatService;
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<Uis.Server.Hubs.ChatHub> _hub;
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<Uis.Server.Hubs.PrivateChatHub> _privateHub;
    public ChatController(ApplicationDbContext db, IFileService fileService, IAudioService audioService, Uis.Server.Services.IChatService chatService, Microsoft.AspNetCore.SignalR.IHubContext<Uis.Server.Hubs.ChatHub> hub, Microsoft.AspNetCore.SignalR.IHubContext<Uis.Server.Hubs.PrivateChatHub> privateHub) {
        _db = db;
        _fileService = fileService;
        _audioService = audioService;
        _chatService = chatService;
        _hub = hub;
        _privateHub = privateHub;
    }

    [HttpGet("Inbox")] public async Task<IActionResult> GetInbox([FromQuery] string filter = "All") {
        var myIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(myIdStr == null) return Unauthorized();
        var myId = Guid.Parse(myIdStr);

        var chats = await _chatService.GetInboxAsync(myId);

        // Apply basic filtering (T037)
        if (filter == "Starred") {
            // Starred logic not yet in DB, returning all for now
        }

        return Ok(chats.Select(c => new ChatSummaryDto {
            Id = c.Id,
            Type = c.Type.ToString(),
            OtherParticipant = new UserDto {
                Id = (c.StudentId == myId ? c.ExecutorId : c.StudentId) ?? Guid.Empty,
                Name = (c.StudentId == myId ? c.Executor?.FullName : c.Student?.FullName) ?? "Unknown",
                ProfilePicture = c.StudentId == myId ? c.Executor?.ProfilePicture : c.Student?.ProfilePicture
            },
            LastMessage = c.Messages.OrderByDescending(m => m.SentAt).Select(m => new MessageDto {
                Id = m.Id, Content = m.Content, SentAt = m.SentAt
            }).FirstOrDefault(),
            UnreadCount = 0
        }));
    }

    [HttpGet("Order/{orderId}")] public async Task<IActionResult> GetOrderChat(Guid orderId) {        var myIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(myIdStr == null) return Unauthorized();
        var myId = Guid.Parse(myIdStr);

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId && (o.StudentId == myId || o.ExecutorId == myId));
        if (order == null) return NotFound("Order not found or access denied.");

        var chat = await _db.Chats.Include(c => c.Messages).ThenInclude(m => m.Sender).Include(c => c.Messages).ThenInclude(m => m.Attachments).FirstOrDefaultAsync(c => c.OrderId == orderId);
        
        if (chat == null) {
            chat = new Chat { OrderId = orderId };
            _db.Chats.Add(chat);
            await _db.SaveChangesAsync();
        }

        return Ok(new ChatDto {
            Id = chat.Id,
            Type = chat.Type.ToString(),
            OrderId = chat.OrderId,
            Messages = chat.Messages.OrderBy(m => m.SentAt).Select(m => new MessageDto {
                Id = m.Id, ChatId = m.ChatId, SenderId = m.SenderId, Content = m.Content, SentAt = m.SentAt,
                WaveformData = m.WaveformData,
                Attachments = m.Attachments.Select(a => new AttachmentDto { Url = a.Url, FileName = a.FileName, FileType = a.FileType, FileSize = a.FileSize }).ToList()
            }).ToList()
        });
    }

    [HttpPost("Private/Initiate")] public async Task<IActionResult> InitiatePrivateChat([FromBody] InitiateChatDto dto) {
        var myIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(myIdStr == null) return Unauthorized();
        var myId = Guid.Parse(myIdStr);

        var chat = await _chatService.InitializePrivateChatAsync(myId, dto.ExecutorId);

        return Ok(new ChatDto {
            Id = chat.Id,
            Type = chat.Type.ToString(),
            Messages = chat.Messages.OrderBy(m => m.SentAt).Select(m => new MessageDto {
                Id = m.Id, ChatId = m.ChatId, SenderId = m.SenderId, Content = m.Content, SentAt = m.SentAt,
                WaveformData = m.WaveformData,
                CustomOffer = m.CustomOffer != null ? new CustomOfferDto {
                    Id = m.CustomOffer.Id, Title = m.CustomOffer.Title, Price = m.CustomOffer.Price, Status = m.CustomOffer.Status
                } : null,
                Attachments = m.Attachments.Select(a => new AttachmentDto { Url = a.Url, FileName = a.FileName, FileType = a.FileType, FileSize = a.FileSize }).ToList()
            }).ToList()
        });
    }

    [HttpPost("{chatId}/Message")] public async Task<IActionResult> SendMessage(Guid chatId, [FromForm] string? content, [FromForm] List<IFormFile>? attachments, [FromForm] IFormFile? audioFile) {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);
        var sender = await _db.Users.FindAsync(uid);
        var chat = await _db.Chats.FindAsync(chatId);
        if (chat == null) return NotFound("Chat not found.");
        
        var msg = new Message { ChatId = chatId, SenderId = uid, Content = content ?? "", SentAt = DateTime.UtcNow };

        if (audioFile != null && audioFile.Length > 0) {
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(audioFile.FileName);
            var url = await _fileService.UploadFileAsync(audioFile.OpenReadStream(), fileName);
            msg.Attachments.Add(new MessageAttachment { 
                Url = url, FileName = audioFile.FileName, FileType = "Audio", FileSize = audioFile.Length 
            });
            // T031: Process waveform
            msg.WaveformData = await _audioService.ExtractWaveformDataAsync(Path.Combine("wwwroot", "uploads", fileName));
        }

        if (attachments != null) {
            foreach (var file in attachments) {
                if (file.Length > 20 * 1024 * 1024) continue;
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var url = await _fileService.UploadFileAsync(file.OpenReadStream(), fileName);
                string type = file.ContentType.StartsWith("image/") ? "Image" : "Document";
                msg.Attachments.Add(new MessageAttachment { 
                    Url = url, FileName = file.FileName, FileType = type, FileSize = file.Length 
                });
            }
        }

        _db.Messages.Add(msg);
        await _db.SaveChangesAsync();

        var dto = new MessageDto {
            Id = msg.Id, ChatId = msg.ChatId, SenderId = msg.SenderId, Content = msg.Content, SentAt = msg.SentAt,
            WaveformData = msg.WaveformData,
            Attachments = msg.Attachments.Select(a => new AttachmentDto { Url = a.Url, FileName = a.FileName, FileType = a.FileType, FileSize = a.FileSize }).ToList()
        };

        if (chat.Type == ChatType.PrivateChat) {
            await _privateHub.Clients.Group(chatId.ToString()).SendAsync("ReceiveMessage", dto);
        } else {
            await _hub.Clients.Group(chatId.ToString()).SendAsync("ReceiveMessage", dto);
        }

        return Ok(dto);
    }

    [HttpPost("Attachments")]
    public async Task<IActionResult> UploadAttachment(IFormFile file) {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
        if (file.Length > 20 * 1024 * 1024) return BadRequest("File exceeds 20MB limit.");

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var url = await _fileService.UploadFileAsync(file.OpenReadStream(), fileName);
        
        string type = "file";
        if (file.ContentType.StartsWith("image/")) type = "image";
        else if (file.ContentType.StartsWith("audio/")) type = "audio";
        else if (file.ContentType.StartsWith("video/")) type = "video";

        return Ok(new { url, type });
    }

    [HttpPost("Offers")]
    public async Task<IActionResult> SendCustomOffer([FromBody] CustomOfferRequest dto) {
        var myIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(myIdStr == null) return Unauthorized();
        var executorId = Guid.Parse(myIdStr);

        try {
            var offer = new CustomOffer {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                DeliveryDays = dto.DeliveryDays
            };
            offer = await _chatService.SendCustomOfferAsync(dto.ChatId, executorId, offer);

            var payload = new {
                CustomOffer = offer,
                ChatId = dto.ChatId,
                SenderId = executorId
            };
            await _privateHub.Clients.Group(dto.ChatId.ToString()).SendAsync("ReceiveCustomOffer", payload);
            
            return Ok(offer);
        } catch (Exception ex) {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("Offers/{id}/Accept")]
    public async Task<IActionResult> AcceptCustomOffer(Guid id) {
        var myIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(myIdStr == null) return Unauthorized();
        var studentId = Guid.Parse(myIdStr);

        try {
            var order = await _chatService.AcceptCustomOfferAsync(id, studentId);
            return Ok(new { orderId = order.Id });
        } catch (Exception ex) {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class CustomOfferRequest {
    public Guid ChatId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DeliveryDays { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketController : ControllerBase {
    private readonly ApplicationDbContext _db; 
    private readonly IFileService _fileService;
    private readonly IHubContext<Uis.Server.Hubs.ChatHub> _hub;
    public TicketController(ApplicationDbContext db, IFileService fileService, IHubContext<Uis.Server.Hubs.ChatHub> hub) { 
        _db = db; 
        _fileService = fileService;
        _hub = hub;
    }
    
    [HttpGet] public async Task<IActionResult> GetMyTickets() {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);
        var tickets = await _db.Tickets.Where(t => t.UserId == uid).OrderByDescending(t => t.Id).ToListAsync();
        return Ok(tickets.Select(t => new { t.Id, t.Subject, t.Status }));
    }

    [HttpGet("{id}")] public async Task<IActionResult> GetById(Guid id) {
        var ticket = await _db.Tickets.Include(t => t.Messages).ThenInclude(m => m.Sender).Include(t => t.Messages).ThenInclude(m => m.Attachments).FirstOrDefaultAsync(t => t.Id == id);
        if (ticket == null) return NotFound();
        return Ok(new {
            ticket.Id, ticket.Subject, ticket.Status,
            Messages = ticket.Messages.OrderBy(m => m.SentAt).Select(m => new {
                m.Id, m.Content, m.SentAt, m.SenderId, SenderName = m.Sender.FullName,
                Attachments = m.Attachments.Select(a => new { a.Url, a.FileName, a.FileType, a.FileSize })
            })
        });
    }

    [HttpPost] public async Task<IActionResult> Create([FromBody] string subject) {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var ticket = new Ticket { UserId = Guid.Parse(userIdStr), Subject = subject };
        _db.Tickets.Add(ticket); await _db.SaveChangesAsync();
        return Ok(ticket);
    }

    [HttpPost("{id}/Reply")] public async Task<IActionResult> Reply(Guid id, [FromForm] string? content, [FromForm] List<IFormFile>? attachments) {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);
        var sender = await _db.Users.FindAsync(uid);

        var msg = new TicketMessage { TicketId = id, SenderId = uid, Content = content ?? "", SentAt = DateTime.UtcNow };

        if (attachments != null) {
            foreach (var file in attachments) {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var url = await _fileService.UploadFileAsync(file.OpenReadStream(), fileName);
                string type = file.ContentType.StartsWith("image/") ? "Image" : "Document";
                msg.Attachments.Add(new MessageAttachment { 
                    Url = url, FileName = file.FileName, FileType = type, FileSize = file.Length 
                });
            }
        }

        _db.TicketMessages.Add(msg);
        await _db.SaveChangesAsync();

        await _hub.Clients.Group("ticket-" + id.ToString()).SendAsync("ReceiveTicketMessage", new {
            Id = msg.Id,
            Content = msg.Content,
            SentAt = msg.SentAt,
            SenderId = msg.SenderId,
            SenderName = sender?.FullName,
            Attachments = msg.Attachments.Select(a => new { a.Url, a.FileName, a.FileType, a.FileSize })
        });

        return Ok(msg);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KycController : ControllerBase {
    private readonly ApplicationDbContext _db;
    private readonly IFileService _fileService;
    private readonly IKycService _kycService;

    public KycController(ApplicationDbContext db, IFileService fileService, IKycService kycService) { 
        _db = db; 
        _fileService = fileService;
        _kycService = kycService;
    }

    [HttpGet("Status")] public async Task<IActionResult> GetStatus() {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);
        var kyc = await _db.KycRequests.OrderByDescending(k => k.Id).FirstOrDefaultAsync(k => k.UserId == uid);
        return Ok(new { Status = kyc?.Status, RejectionReason = kyc?.RejectionReason });
    }

    [HttpPost] 
    [DisableRequestSizeLimit]
    public async Task<IActionResult> Submit([FromForm] KycSubmitDto dto) {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);

        string? frontUrl = null;
        string? backUrl = null;

        if (dto.NationalIdFront != null && dto.NationalIdFront.Length > 0) {
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.NationalIdFront.FileName);
            frontUrl = await _fileService.UploadFileAsync(dto.NationalIdFront.OpenReadStream(), fileName);
        }

        if (dto.NationalIdBack != null && dto.NationalIdBack.Length > 0) {
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.NationalIdBack.FileName);
            backUrl = await _fileService.UploadFileAsync(dto.NationalIdBack.OpenReadStream(), fileName);
        }

        await _kycService.SubmitKycAsync(uid, dto.NationalId, dto.Phone, frontUrl, backUrl);
        return Ok(new { success = true });
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase {
    private readonly INotificationService _notificationService;
    public NotificationsController(INotificationService notificationService) { 
        _notificationService = notificationService;
    }

    [HttpGet] public async Task<IActionResult> GetMyNotifications() {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userIdStr == null) return Unauthorized();
        var uid = Guid.Parse(userIdStr);
        return Ok(await _notificationService.GetUserNotificationsAsync(uid));
    }

    [HttpPost("MarkRead/{id}")] public async Task<IActionResult> MarkRead(Guid id) {
        await _notificationService.MarkAsReadAsync(id);
        return Ok(new { success = true });
    }

    [HttpDelete("{id}")] public async Task<IActionResult> Delete(Guid id) {
        await _notificationService.DeleteNotificationAsync(id);
        return Ok(new { success = true });
    }
}

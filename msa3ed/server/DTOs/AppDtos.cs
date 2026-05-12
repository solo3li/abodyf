namespace Uis.Server.DTOs;

public class LoginDto { 
    public string Email { get; set; } = string.Empty; 
    public string Password { get; set; } = string.Empty; 
}

public class RegisterDto { 
    public string FullName { get; set; } = string.Empty; 
    public string Email { get; set; } = string.Empty; 
    public string Password { get; set; } = string.Empty; 
    public string Role { get; set; } = "Student"; 
}

public class OtpVerifyDto { 
    public string Email { get; set; } = string.Empty; 
    public string Code { get; set; } = string.Empty; 
}

public class CreateOrderDto { 
    public Guid ServiceId { get; set; } 
    public decimal Price { get; set; } 
}

public class KycSubmitDto {
    public string NationalId { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public IFormFile? NationalIdFront { get; set; }
    public IFormFile? NationalIdBack { get; set; }
}

public class UpdateProfileDto {
    public string FullName { get; set; } = string.Empty;
    public string? University { get; set; }
    public string? Major { get; set; }
    public string? Bio { get; set; }
}

public class AuthResponseDto {
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = new();
}

public class UserDto {
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    public bool IsExecutor { get; set; }
    public IEnumerable<string> Roles { get; set; } = new List<string>();
}

public class ChatDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public Guid? OrderId { get; set; }
    public string? OrderTitle { get; set; }
    public UserDto? OtherParticipant { get; set; }
    public List<MessageDto> Messages { get; set; } = new();
}

public class ChatSummaryDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public UserDto OtherParticipant { get; set; } = null!;
    public MessageDto? LastMessage { get; set; }
    public int UnreadCount { get; set; }
    public bool IsStarred { get; set; }
}

public class MessageDto
{
    public Guid Id { get; set; }
    public Guid ChatId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public int[]? WaveformData { get; set; }
    public List<AttachmentDto> Attachments { get; set; } = new();
    public CustomOfferDto? CustomOffer { get; set; }
    public DateTime SentAt { get; set; }
}

public class AttachmentDto
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
}

public class CustomOfferDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DeliveryDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid ExecutorId { get; set; }
    public Guid StudentId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateOfferDto
{
    public Guid ChatId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DeliveryDays { get; set; }
}

public class InitiateChatDto
{
    public Guid ExecutorId { get; set; }
}
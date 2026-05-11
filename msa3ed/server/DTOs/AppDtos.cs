namespace Uis.Server.DTOs;

public class LoginDto { 
    public string Email { get; set; } = string.Empty; 
    public string Password { get; set; } = string.Empty; 
}

public class VerifyOtpDto {
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public class RegisterDto { 
    public string FullName { get; set; } = string.Empty; 
    public string Email { get; set; } = string.Empty; 
    public string Password { get; set; } = string.Empty; 
    public string Role { get; set; } = "Student"; 
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
    public bool IsExecutor { get; set; }
    public IEnumerable<string> Roles { get; set; } = new List<string>();
}
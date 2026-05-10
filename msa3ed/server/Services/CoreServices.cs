using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Uis.Server.Data;
using Uis.Server.Models;
using Uis.Server.DTOs;

namespace Uis.Server.Services;

public interface IEmailService 
{ 
    Task SendEmailAsync(string to, string subject, string body); 
    Task SendWelcomeEmailAsync(string to, string name);
    Task SendTemplatedEmailAsync(string to, string subject, string title, string message, string? buttonText = null, string? buttonUrl = null); 
}

public class EmailService : IEmailService {
    private readonly IConfiguration _config;
    private readonly IServiceProvider _serviceProvider;

    public EmailService(IConfiguration config, IServiceProvider serviceProvider) { 
        _config = config; 
        _serviceProvider = serviceProvider;
    }
    
    private async Task<string> GetSettingAsync(string key, string defaultValue)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var setting = await db.SystemSettings.FindAsync(key);
        return setting?.Value ?? defaultValue;
    }

    public async Task SendEmailAsync(string to, string subject, string body) {
        var smtpServer = await GetSettingAsync("Email.SmtpServer", _config["EmailSettings:SmtpServer"] ?? "");
        var smtpPort = await GetSettingAsync("Email.SmtpPort", _config["EmailSettings:SmtpPort"] ?? "587");
        var senderName = await GetSettingAsync("Email.SenderName", _config["EmailSettings:SenderName"] ?? "UIS");
        var senderEmail = await GetSettingAsync("Email.SenderEmail", _config["EmailSettings:SenderEmail"] ?? "");
        var password = await GetSettingAsync("Email.Password", _config["EmailSettings:Password"] ?? "");

        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(senderName, senderEmail));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

            using var smtp = new SmtpClient();
            smtp.Timeout = 5000; // 5 seconds fast fail
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            await smtp.ConnectAsync(smtpServer, int.Parse(smtpPort), SecureSocketOptions.StartTls, cts.Token);
            await smtp.AuthenticateAsync(senderEmail, password, cts.Token);
            await smtp.SendAsync(email, cts.Token);
            await smtp.DisconnectAsync(true, cts.Token);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\n=========================================");
            Console.WriteLine($"[SMTP ATTEMPT] Failed to send email to {to}");
            Console.WriteLine($"Error: {ex.Message}");
            Console.WriteLine($"Here is the email content (OTP/Token):");
            Console.WriteLine(body);
            Console.WriteLine($"=========================================\n");
        }
    }

    public async Task SendWelcomeEmailAsync(string to, string name)
    {
        var baseTemplate = await GetSettingAsync("Email.Template.Base", EmailTemplates.GetDefaultBaseTemplate());
        var body = EmailTemplates.Wrap("مرحباً بك في رحاب UIS", $@"
            <p>أهلاً بك يا <strong>{name}</strong> في عائلة UIS!</p>
            <p>نحن سعداء جداً بانضمامك إلينا. الآن يمكنك البدء في طلب الخدمات الجامعية أو العمل كمنفذ للمشاريع.</p>
            <p style='margin-top: 15px;'>اكتشف عالمنا الجديد وجرب خدماتنا المتميزة.</p>", 
            "ابدأ الآن", "https://uis-app.com/get-started", baseTemplate: baseTemplate);

        await SendEmailAsync(to, "مرحباً بك في UIS!", body);
    }

    public async Task SendTemplatedEmailAsync(string to, string subject, string title, string message, string? buttonText = null, string? buttonUrl = null) {
        var baseTemplate = await GetSettingAsync("Email.Template.Base", EmailTemplates.GetDefaultBaseTemplate());
        var body = EmailTemplates.Wrap(title, message, buttonText, buttonUrl, baseTemplate: baseTemplate);
        await SendEmailAsync(to, subject, body);
    }
}

public interface IAuthService { 
    Task<string?> LoginAsync(LoginDto dto); 
    Task<bool> RegisterAsync(RegisterDto dto); 
    Task<string?> VerifyOtpAsync(VerifyOtpDto dto);
    Task<bool> VerifyEmailAsync(string token);
}
public class AuthService : IAuthService {
    private readonly ApplicationDbContext _db; private readonly IJwtService _jwt; private readonly IEmailService _email;
    public AuthService(ApplicationDbContext db, IJwtService jwt, IEmailService email) { _db = db; _jwt = jwt; _email = email; }
    
    public async Task<string?> LoginAsync(LoginDto dto) {
        var user = await _db.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || user.PasswordHash != dto.Password) return null;
        
        if (!user.IsEmailVerified) return "EMAIL_NOT_VERIFIED";

        user.OtpCode = new Random().Next(1000, 9999).ToString();
        user.OtpExpiry = DateTime.UtcNow.AddMinutes(5);
        await _db.SaveChangesAsync();

        await _email.SendTemplatedEmailAsync(user.Email, "رمز الدخول", "رمز الدخول الخاص بك", $"رمز التحقق: {user.OtpCode}");

        return "OTP_SENT";
    }
    
    public async Task<bool> RegisterAsync(RegisterDto dto) {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email)) return false;

        // Every registered user is a Student by default
        var studentRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Student");
        if (studentRole == null) {
            studentRole = new Role { Name = "Student", IsSystemRole = true };
            _db.Roles.Add(studentRole);
        }

        var token = Guid.NewGuid().ToString();

        var user = new User { 
            Email = dto.Email, 
            FullName = dto.FullName, 
            PasswordHash = dto.Password,
            IsAdmin = false,
            IsExecutor = false,
            IsStaff = false,
            IsEmailVerified = false,
            EmailVerificationToken = token
        };

        user.Roles.Add(studentRole);

        _db.Users.Add(user); await _db.SaveChangesAsync(); 

        var link = $"http://104.248.250.176:5035/api/Auth/verify-email?token={token}";
        await _email.SendTemplatedEmailAsync(user.Email, "تأكيد البريد", "تأكيد الحساب", "يرجى تأكيد الحساب", "تأكيد", link);

        return true;
    }

    public async Task<string?> VerifyOtpAsync(VerifyOtpDto dto) {
        var user = await _db.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || user.OtpCode != dto.OtpCode || user.OtpExpiry < DateTime.UtcNow) return null;
        
        user.OtpCode = null;
        user.OtpExpiry = null;
        await _db.SaveChangesAsync();
        
        return _jwt.GenerateToken(user);
    }

    public async Task<bool> VerifyEmailAsync(string token) {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);
        if (user == null) return false;
        
        user.IsEmailVerified = true;
        user.EmailVerificationToken = null;
        await _db.SaveChangesAsync();
        return true;
    }
}

public interface IJwtService { string GenerateToken(User user); }
public class JwtService : IJwtService {
    private readonly IConfiguration _config; public JwtService(IConfiguration config) { _config = config; }
    public string GenerateToken(User user) {
        var claims = new List<Claim> { 
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), 
            new Claim(ClaimTypes.Email, user.Email) 
        };

        // Add all roles to claims
        foreach (var role in user.Roles) {
            claims.Add(new Claim(ClaimTypes.Role, role.Name));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Secret"] ?? "default_secret_key_default_secret_key_default_secret_key"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(issuer: _config["JwtSettings:Issuer"], audience: _config["JwtSettings:Audience"], claims: claims, expires: DateTime.UtcNow.AddDays(7), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public interface IUserService { Task<User?> GetUserByIdAsync(Guid id); Task<IEnumerable<User>> GetAllUsersAsync(); }
public class UserService : IUserService {
    private readonly ApplicationDbContext _db; public UserService(ApplicationDbContext db) { _db = db; }
    public async Task<User?> GetUserByIdAsync(Guid id) => await _db.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == id);
    public async Task<IEnumerable<User>> GetAllUsersAsync() => await _db.Users.Include(u => u.Roles).ToListAsync();
}
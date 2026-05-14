using Microsoft.EntityFrameworkCore;
using Uis.Server.Models;

namespace Uis.Server.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<EmailOtp> EmailOtps { get; set; } = null!;
    public DbSet<KycRequest> KycRequests { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Service> Services { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<Escrow> Escrows { get; set; } = null!;
    public DbSet<Chat> Chats { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<MessageAttachment> MessageAttachments { get; set; } = null!;
    public DbSet<CustomOffer> CustomOffers { get; set; } = null!;
    public DbSet<Ticket> Tickets { get; set; } = null!;
    public DbSet<TicketMessage> TicketMessages { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Favorite> Favorites { get; set; } = null!;
    public DbSet<FileAttachment> Files { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<RolePermission> RolePermissions { get; set; } = null!;
    public DbSet<SystemSetting> SystemSettings { get; set; } = null!;
    public DbSet<WalletTransaction> WalletTransactions { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    public DbSet<WithdrawalRequest> WithdrawalRequests { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<Dispute> Disputes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Many-to-Many between User and Role
        modelBuilder.Entity<User>()
            .HasMany(u => u.Roles)
            .WithMany(r => r.Users)
            .UsingEntity(j => j.ToTable("UserRoles"));

        // Configure Favorite (Unique constraint on UserId and ServiceId)
        modelBuilder.Entity<Favorite>()
            .HasIndex(f => new { f.UserId, f.ServiceId })
            .IsUnique();

        // Configure SystemSetting
        modelBuilder.Entity<SystemSetting>().HasKey(s => s.Key);

        // Seed initial settings
        modelBuilder.Entity<SystemSetting>().HasData(
            new SystemSetting { Key = "MinWithdrawalAmount", Value = "100", Description = "Minimum balance required to request a withdrawal" },
            new SystemSetting { Key = "CommissionRate", Value = "10", Description = "Platform commission percentage" }
        );
    }
}

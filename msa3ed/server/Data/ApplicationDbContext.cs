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
    public DbSet<ServiceTag> ServiceTags { get; set; } = null!;
    public DbSet<ServiceOfferingTag> ServiceOfferingTags { get; set; } = null!;
    public DbSet<GalleryItem> GalleryItems { get; set; } = null!;
    public DbSet<ServiceApprovalLog> ServiceApprovalLogs { get; set; } = null!;
    public DbSet<ProjectRequest> ProjectRequests { get; set; } = null!;
    public DbSet<ProjectOffer> ProjectOffers { get; set; } = null!;
    public DbSet<ProjectInvitation> ProjectInvitations { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure Many-to-Many between User and Role
        modelBuilder.Entity<User>()
            .HasMany(u => u.Roles)
            .WithMany(r => r.Users)
            .UsingEntity(j => j.ToTable("UserRoles"));

        // Configure Many-to-Many between Service and ServiceTag
        modelBuilder.Entity<ServiceOfferingTag>()
            .HasKey(sot => new { sot.ServiceId, sot.TagId });

        modelBuilder.Entity<ServiceOfferingTag>()
            .HasOne(sot => sot.Service)
            .WithMany(s => s.ServiceOfferingTags)
            .HasForeignKey(sot => sot.ServiceId);

        modelBuilder.Entity<ServiceOfferingTag>()
            .HasOne(sot => sot.Tag)
            .WithMany(t => t.ServiceOfferingTags)
            .HasForeignKey(sot => sot.TagId);

        // Configure Favorite (Unique constraint on UserId and ServiceId)
        modelBuilder.Entity<Favorite>()
            .HasIndex(f => new { f.UserId, f.ServiceId })
            .IsUnique();

        // Configure SystemSetting
        modelBuilder.Entity<SystemSetting>().HasKey(s => s.Key);
    }
}

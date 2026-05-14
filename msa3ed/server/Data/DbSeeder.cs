using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Uis.Server.Models;
using Uis.Server.Services;

namespace Uis.Server.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await context.Database.MigrateAsync();

        // 1. Clear existing data for a clean demo state (optional, but good for "seed all")
        // context.EmailOtps.RemoveRange(context.EmailOtps);
        // await context.SaveChangesAsync();

        // 2. Seed Roles
        var adminRole = await GetOrCreateRole(context, "Admin", "Full access to all system features", true);
        var studentRole = await GetOrCreateRole(context, "Student", "Standard student access", true);
        var executorRole = await GetOrCreateRole(context, "Executor", "Service execution access", true);
        await context.SaveChangesAsync();

        // 3. Seed Permissions
        if (!await context.Permissions.AnyAsync())
        {
            var permissions = new List<Permission>
            {
                new Permission { Group = "Management", Name = "Users.View", Description = "Can view users list and details" },
                new Permission { Group = "Management", Name = "Users.Edit", Description = "Can toggle user status and edit roles" },
                new Permission { Group = "Management", Name = "Roles.Manage", Description = "Full control over roles and permissions" },
                new Permission { Group = "KYC", Name = "Kyc.Process", Description = "Can approve or reject KYC requests" },
                new Permission { Group = "Catalog", Name = "Services.Manage", Description = "Can CRUD services and categories" },
                new Permission { Group = "Operations", Name = "Orders.View", Description = "Can monitor all orders" },
                new Permission { Group = "Operations", Name = "Orders.Manage", Description = "Can update order statuses" },
                new Permission { Group = "Finance", Name = "Payments.View", Description = "Can view transaction history" },
                new Permission { Group = "Finance", Name = "Disputes.Resolve", Description = "Can arbitrate and resolve financial disputes" },
                new Permission { Group = "Support", Name = "Tickets.Manage", Description = "Can respond to and close support tickets" }
            };
            context.Permissions.AddRange(permissions);
            await context.SaveChangesAsync();

            foreach (var p in permissions)
            {
                context.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id });
            }
            await context.SaveChangesAsync();
        }

        // 4. Seed Admin
        var admin = await GetOrCreateUser(context, "admin@uis.com", "مدير النظام الرئيسي", "admin123", new List<Role> { adminRole, studentRole },
            isAdmin: true, isStaff: true, uni: "جامعة القاهرة", major: "إدارة نظم معلومات",
            bio: "مدير المنصة المسؤول عن المراجعة والتحكيم.");

        // 5. Seed Multiple Students
        var student1 = await GetOrCreateUser(context, "ahmed@student.com", "أحمد محمد علي", "student123", new List<Role> { studentRole },
            uni: "جامعة الإسكندرية", major: "هندسة برمجيات", bio: "طالب مهتم بتطوير التطبيقات.");
        
        var student2 = await GetOrCreateUser(context, "sara@student.com", "سارة محمود حسن", "student123", new List<Role> { studentRole },
            uni: "جامعة عين شمس", major: "حاسبات ومعلومات", bio: "أبحث عن مساعدة في مشاريع التخرج.");

        // 6. Seed Multiple Executors (with KYC)
        var executor1 = await GetOrCreateUser(context, "khaled@executor.com", "خالد إبراهيم", "executor123", new List<Role> { studentRole, executorRole },
            isExecutor: true, uni: "جامعة القاهرة", major: "فنون جميلة", bio: "مصمم جرافيك خبير في الهويات البصرية.");
        executor1.WalletBalance = 2500.00m;

        var executor2 = await GetOrCreateUser(context, "mona@executor.com", "منى يوسف", "executor123", new List<Role> { studentRole, executorRole },
            isExecutor: true, uni: "جامعة حلوان", major: "لغات وترجمة", bio: "مترجمة معتمدة للبحوث العلمية.");
        executor2.WalletBalance = 1200.00m;

        // 7. Seed KYC Requests
        if (!await context.KycRequests.AnyAsync())
        {
            context.KycRequests.AddRange(
                new KycRequest { UserId = executor1.Id, NationalId = "29012345678901", Status = "Approved", Phone = "01012345678" },
                new KycRequest { UserId = executor2.Id, NationalId = "29512345678902", Status = "Approved", Phone = "01112345679" },
                new KycRequest { UserId = student1.Id, NationalId = "29812345678903", Status = "Pending", Phone = "01212345680" }
            );
        }

        // 8. Seed Categories
        if (!await context.Categories.AnyAsync())
        {
            context.Categories.AddRange(
                new Category { Name = "مشاريع تخرج" },
                new Category { Name = "تصميم جرافيك" },
                new Category { Name = "برمجة تطبيقات" },
                new Category { Name = "ترجمة معتمدة" },
                new Category { Name = "أبحاث علمية" }
            );
            await context.SaveChangesAsync();
        }
        var categories = await context.Categories.ToListAsync();

        // 9. Seed Services
        if (!await context.Services.AnyAsync())
        {
            var services = new List<Service>
            {
                new Service {
                    Title = "تصميم عرض تقديمي احترافي لمشروع التخرج",
                    Description = "تصميم عروض PowerPoint و Canva احترافية متوافقة مع معايير الجامعة.",
                    BasePrice = 150,
                    CategoryId = categories.First(c => c.Name == "تصميم جرافيك").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=800",
                    ExecutorId = executor1.Id,
                    Rating = 4.9m, ReviewsCount = 12, DeliveryTime = "يومان"
                },
                new Service {
                    Title = "برمجة تطبيق موبايل متكامل",
                    Description = "تنفيذ الجانب البرمجي لمشاريع التخرج باستخدام تقنيات حديثة.",
                    BasePrice = 1200,
                    CategoryId = categories.First(c => c.Name == "برمجة تطبيقات").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800",
                    ExecutorId = executor1.Id,
                    Rating = 5.0m, ReviewsCount = 5, DeliveryTime = "7 أيام"
                },
                new Service {
                    Title = "ترجمة أكاديمية للمقالات العلمية",
                    Description = "ترجمة دقيقة من الإنجليزية للعربية وبالعكس مع التدقيق اللغوي.",
                    BasePrice = 80,
                    CategoryId = categories.First(c => c.Name == "ترجمة معتمدة").Id,
                    ImageUrl = "https://images.unsplash.com/photo-1544650039-2287f6071477?q=80&w=800",
                    ExecutorId = executor2.Id,
                    Rating = 4.7m, ReviewsCount = 8, DeliveryTime = "يوم واحد"
                }
            };
            context.Services.AddRange(services);
            await context.SaveChangesAsync();
        }
        var serviceList = await context.Services.ToListAsync();

        // 10. Seed Orders, Payments, and Escrows
        if (!await context.Orders.AnyAsync())
        {
            var order1 = new Order { 
                StudentId = student1.Id, 
                ExecutorId = executor1.Id, 
                ServiceId = serviceList[0].Id, 
                Price = 150, 
                Status = "Completed",
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            };
            context.Orders.Add(order1);
            await context.SaveChangesAsync();

            context.Payments.Add(new Payment { OrderId = order1.Id, Amount = 150, Status = "Completed", TransactionId = "TXN_001" });
            context.Escrows.Add(new Escrow { OrderId = order1.Id, Amount = 150, Status = "Released" });
            
            // Order 2 (In Progress)
            var order2 = new Order { 
                StudentId = student2.Id, 
                ExecutorId = executor1.Id, 
                ServiceId = serviceList[1].Id, 
                Price = 1200, 
                Status = "InProgress",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            };
            context.Orders.Add(order2);
            await context.SaveChangesAsync();
            context.Payments.Add(new Payment { OrderId = order2.Id, Amount = 1200, Status = "Completed", TransactionId = "TXN_002" });
            context.Escrows.Add(new Escrow { OrderId = order2.Id, Amount = 1200, Status = "Held" });

            // Order 3 (Disputed)
            var order3 = new Order { 
                StudentId = student1.Id, 
                ExecutorId = executor2.Id, 
                ServiceId = serviceList[2].Id, 
                Price = 80, 
                Status = "Disputed",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            };
            context.Orders.Add(order3);
            await context.SaveChangesAsync();
            context.Disputes.Add(new Dispute { 
                OrderId = order3.Id, 
                OpenedByUserId = student1.Id, 
                Description = "الترجمة غير دقيقة وبها أخطاء إملائية كثيرة.",
                Status = "Open",
                CreatedAt = DateTime.UtcNow.AddDays(-4),
                EvidenceUrl = "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800"
            });
        }

        // 11. Seed Reviews
        if (!await context.Reviews.AnyAsync())
        {
            var completedOrder = await context.Orders.FirstOrDefaultAsync(o => o.Status == "Completed");
            if (completedOrder != null)
            {
                context.Reviews.Add(new Review {
                    OrderId = completedOrder.Id,
                    ServiceId = completedOrder.ServiceId,
                    FromUserId = completedOrder.StudentId,
                    ToUserId = completedOrder.ExecutorId!.Value,
                    Rating = 5,
                    Comment = "عمل رائع ومتقن جداً، شكراً لك!",
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                });
            }
        }

        // 12. Seed Withdrawals
        if (!await context.WithdrawalRequests.AnyAsync())
        {
            context.WithdrawalRequests.Add(new WithdrawalRequest {
                ExecutorId = executor1.Id,
                Amount = 500,
                Status = "Approved",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                ProcessedAt = DateTime.UtcNow.AddDays(-2),
                ScreenshotUrl = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800",
                AdminNotes = "تم التحويل بنجاح"
            });
            context.WithdrawalRequests.Add(new WithdrawalRequest {
                ExecutorId = executor2.Id,
                Amount = 300,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow.AddMinutes(-30),
                ScreenshotUrl = "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800"
            });
        }

        // 12.5 Seed Deposits
        if (!await context.Deposits.AnyAsync())
        {
            context.Deposits.Add(new DepositRequest {
                UserId = student1.Id,
                Amount = 1000,
                Status = "Approved",
                CreatedAt = DateTime.UtcNow.AddDays(-7),
                ProcessedAt = DateTime.UtcNow.AddDays(-6),
                ScreenshotUrl = "https://images.unsplash.com/photo-1554224155-111221a0675c?q=80&w=800",
                AdminNotes = "تم قبول الإيداع"
            });
            context.Deposits.Add(new DepositRequest {
                UserId = student2.Id,
                Amount = 500,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                ScreenshotUrl = "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800"
            });
        }

        // 13. Seed Tickets
        if (!await context.Tickets.AnyAsync())
        {
            var ticket = new Ticket {
                UserId = student2.Id,
                Subject = "مشكلة في الدفع",
                Status = "Open",
                CreatedAt = DateTime.UtcNow.AddHours(-5)
            };
            context.Tickets.Add(ticket);
            await context.SaveChangesAsync();
            context.TicketMessages.Add(new TicketMessage {
                TicketId = ticket.Id,
                SenderId = student2.Id,
                Content = "حاولت الدفع لطلب ولكن لم يتم تحديث الحالة.",
                SentAt = DateTime.UtcNow.AddHours(-5)
            });
        }

        // 14. Seed Audit Logs
        if (!await context.AuditLogs.AnyAsync())
        {
            context.AuditLogs.Add(new AuditLog {
                AdminId = admin.Id,
                Action = "ApproveKyc",
                TargetEntityType = "KYC",
                TargetEntityId = executor1.Id.ToString(),
                Details = "تم قبول طلب توثيق خالد إبراهيم",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            });
        }

        await SeedSystemSettings(context);
        await context.SaveChangesAsync();
    }


    private static async Task SeedSystemSettings(ApplicationDbContext context)
    {
        if (!await context.SystemSettings.AnyAsync())
        {
            context.SystemSettings.AddRange(
                new SystemSetting { Key = "Email.SmtpServer", Value = "smtp.gmail.com", Description = "SMTP Server Host" },
                new SystemSetting { Key = "Email.SmtpPort", Value = "587", Description = "SMTP Server Port" },
                new SystemSetting { Key = "Email.SenderName", Value = "UIS", Description = "Sender Display Name" },
                new SystemSetting { Key = "Email.SenderEmail", Value = "fps60y@gmail.com", Description = "Sender Email Address" },
                new SystemSetting { Key = "Email.Password", Value = "pljh isws wssg oakn", Description = "SMTP App Password" },
                new SystemSetting { Key = "Email.Template.Base", Value = EmailTemplates.GetDefaultBaseTemplate(), Description = "Main HTML Template Wrapper (Use {TITLE} and {CONTENT})" },
                new SystemSetting { Key = "CommissionRate", Value = "0.10", Description = "Platform Commission Rate" },
                new SystemSetting { Key = "MaxWalletTopUp", Value = "10000", Description = "Max Top-Up Limit" },
                new SystemSetting { Key = "PlatformName", Value = "UIS", Description = "Platform Name" }
            );
        }
    }

    private static async Task<Role> GetOrCreateRole(ApplicationDbContext context, string name, string? description = null, bool isSystem = false)
    {
        var role = await context.Roles.FirstOrDefaultAsync(r => r.Name == name);
        if (role == null)
        {
            role = new Role { Name = name, Description = description, IsSystemRole = isSystem };
            context.Roles.Add(role);
        }
        return role;
    }

    private static async Task<User> GetOrCreateUser(ApplicationDbContext context, string email, string fullName, string password, List<Role> roles,
        bool isAdmin = false, bool isExecutor = false, bool isStaff = false, string? uni = null, string? major = null, string? bio = null)
    {
        var user = await context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User
            {
                Email = email,
                FullName = fullName,
                PasswordHash = password,
                University = uni,
                Major = major,
                Bio = bio,
                IsAdmin = isAdmin,
                IsExecutor = isExecutor,
                IsStaff = isStaff,
                IsActive = true
            };
            foreach (var role in roles)
            {
                user.Roles.Add(role);
            }
            context.Users.Add(user);
            await context.SaveChangesAsync();
        }
        return user;
    }
}

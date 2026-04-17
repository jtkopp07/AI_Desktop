using System.IO;
using System.IO.Compression;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using AIHelper.Data;
using AIHelper.Models;
using AIHelper.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Listen(System.Net.IPAddress.Loopback, 0);
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=aihelper.db"));

builder.Services.AddHttpClient();
builder.Services.AddSingleton<UploadedFileService>();
builder.Services.AddScoped<OpenAiService>();
builder.Services.AddScoped<BranchDataService>();
builder.Services.AddScoped<ITSupportService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var databasePath = Path.Combine(Environment.CurrentDirectory, "aihelper.db");
    var recreateDatabase = false;

    if (File.Exists(databasePath))
    {
        try
        {
            using var sqliteConnection = new SqliteConnection($"Data Source={databasePath}");
            sqliteConnection.Open();
            using var command = sqliteConnection.CreateCommand();
            command.CommandText = @"SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('Users','Assets','AuditLogs','Projects','ProjectTasks','KnowledgeBaseArticles','SystemMetrics','Notifications');";
            using var reader = command.ExecuteReader();
            var requiredTables = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Users",
                "Assets",
                "AuditLogs",
                "Projects",
                "ProjectTasks",
                "KnowledgeBaseArticles",
                "SystemMetrics",
                "Notifications"
            };

            while (reader.Read())
            {
                requiredTables.Remove(reader.GetString(0));
            }

            if (requiredTables.Count > 0)
            {
                recreateDatabase = true;
            }
        }
        catch
        {
            recreateDatabase = true;
        }

        if (recreateDatabase)
        {
            try
            {
                File.Delete(databasePath);
            }
            catch
            {
                // If deletion fails, continue and let EnsureCreated handle what it can.
            }
        }
    }

    db.Database.EnsureCreated();

    if (!db.Branches.Any())
    {
        db.Branches.AddRange(
            new Branch
            {
                Name = "IT Support Branch",
                Category = "Information Technology",
                Location = "Headquarters",
                Description = "Provides technical support and IT services to all departments.",
                Employees = 15,
                Contact = "it.support@company.com"
            },
            new Branch
            {
                Name = "Sales Branch",
                Category = "Sales",
                Location = "Sales Office",
                Description = "Drives revenue through customer acquisition and relationship management.",
                Employees = 20,
                Contact = "sales@company.com"
            },
            new Branch
            {
                Name = "Marketing Branch",
                Category = "Marketing",
                Location = "Marketing Office",
                Description = "Manages brand identity, advertising campaigns, and market research.",
                Employees = 12,
                Contact = "marketing@company.com"
            },
            new Branch
            {
                Name = "HR Branch",
                Category = "Human Resources",
                Location = "HR Office",
                Description = "Handles employee relations, recruitment, and organizational development.",
                Employees = 8,
                Contact = "hr@company.com"
            });
        db.SaveChanges();
    }

    if (!db.ITSupportTickets.Any())
    {
        db.ITSupportTickets.AddRange(
            new ITSupportTicket
            {
                OrderNumber = 1001,
                Question = "How do I reset my password?",
                Solution = "Go to the login page, click 'Forgot Password', enter your email, and follow the instructions sent to your inbox.",
                BranchId = 1
            },
            new ITSupportTicket
            {
                OrderNumber = 1002,
                Question = "My computer is running slow.",
                Solution = "Close unnecessary programs, clear temporary files, run antivirus scan, and restart your computer. If issues persist, contact IT support.",
                BranchId = 1
            },
            new ITSupportTicket
            {
                OrderNumber = 1003,
                Question = "How do I connect to the company WiFi?",
                Solution = "Go to network settings, select the company WiFi network, enter the password provided by IT, and connect.",
                BranchId = 1
            },
            new ITSupportTicket
            {
                OrderNumber = 1004,
                Question = "I can't access my email.",
                Solution = "Check your internet connection, verify login credentials, or reset your password. Contact IT if the issue continues.",
                BranchId = 1
            },
            new ITSupportTicket
            {
                OrderNumber = 1005,
                Question = "My email is not working.",
                Solution = "Check your internet connection, verify your credentials, or reset your email password through the IT portal.",
                BranchId = 1
            },
            new ITSupportTicket
            {
                OrderNumber = 1006,
                Question = "How do I install new software?",
                Solution = "Submit a software request through the IT portal, or contact your IT representative for approval and installation.",
                BranchId = 1
            },
            new ITSupportTicket
            {
                OrderNumber = 1007,
                Question = "My printer is not working.",
                Solution = "Check printer connections, ensure it's powered on, clear paper jams, and restart the printer. Contact IT support if needed.",
                BranchId = 1
            },
            new ITSupportTicket
            {
                OrderNumber = 1008,
                Question = "How do I set up my new laptop?",
                Solution = "Contact IT support for initial setup, software installation, and account configuration.",
                BranchId = 1
            });
        db.SaveChanges();
    }

    if (!db.Users.Any())
    {
        db.Users.AddRange(
            new User
            {
                Username = "admin",
                Email = "admin@company.com",
                FirstName = "Admin",
                LastName = "User",
                Role = "Administrator",
                IsActive = true,
                BranchId = 1
            },
            new User
            {
                Username = "jane.doe",
                Email = "jane.doe@company.com",
                FirstName = "Jane",
                LastName = "Doe",
                Role = "IT Support",
                IsActive = true,
                BranchId = 1
            });
        db.SaveChanges();
    }

    if (!db.Projects.Any())
    {
        db.Projects.AddRange(
            new Project
            {
                Name = "AIHelper Migration",
                Description = "Migrate the legacy helpdesk system to the new AIHelper portal.",
                Status = "In Progress",
                Priority = "High",
                OwnerId = 1
            },
            new Project
            {
                Name = "Security Audit",
                Description = "Perform a full security and compliance audit for the enterprise platform.",
                Status = "Planning",
                Priority = "Medium",
                OwnerId = 1
            });
        db.SaveChanges();
    }
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapPost("/upload", async (HttpRequest request, UploadedFileService uploadService) =>
{
    if (!request.HasFormContentType)
    {
        return Results.BadRequest(new { error = "Expected multipart/form-data upload." });
    }

    var form = await request.ReadFormAsync();
    var file = form.Files.GetFile("file");

    if (file is null || file.Length == 0)
    {
        return Results.BadRequest(new { error = "A non-empty .zip file is required." });
    }

    if (!file.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { error = "Only .zip files are supported." });
    }

    using var stream = file.OpenReadStream();
    using var zip = new ZipArchive(stream, ZipArchiveMode.Read, leaveOpen: false);
    var loadedFiles = new List<string>();
    var skippedFiles = new List<string>();

    foreach (var entry in zip.Entries)
    {
        if (string.IsNullOrWhiteSpace(entry.Name) || entry.Length == 0)
        {
            skippedFiles.Add(entry.FullName);
            continue;
        }

        if (entry.FullName.Contains("..", StringComparison.Ordinal))
        {
            skippedFiles.Add(entry.FullName);
            continue;
        }

        try
        {
            using var entryStream = entry.Open();
            using var reader = new StreamReader(entryStream);
            var content = await reader.ReadToEndAsync();
            uploadService.AddFile(entry.FullName, content);
            loadedFiles.Add(entry.FullName);
        }
        catch
        {
            skippedFiles.Add(entry.FullName);
        }
    }

    if (loadedFiles.Count == 0)
    {
        return Results.BadRequest(new { error = "No readable files were found inside the ZIP archive." });
    }

    return Results.Json(new
    {
        files = uploadService.GetFileNames(),
        loaded = loadedFiles,
        skipped = skippedFiles
    });
});

app.MapGet("/uploaded-files", (UploadedFileService uploadService) =>
    Results.Json(new { files = uploadService.GetFileNames() }));

app.MapPost("/uploads/clear", (UploadedFileService uploadService) =>
{
    uploadService.ClearFiles();
    return Results.Ok(new { cleared = true });
});

app.MapGet("/health", () => new { status = "AIHelper is running" });

app.MapPost("/submit", async (ChatRequest request, OpenAiService openAiService, BranchDataService branchDataService, ITSupportService itSupportService, UploadedFileService uploadService) =>
{
    if (request is null || string.IsNullOrWhiteSpace(request.Message))
    {
        return Results.BadRequest(new ChatResponse("Please enter a message to send to the AI."));
    }

    var model = !string.IsNullOrWhiteSpace(request.Model)
        ? request.Model.Trim()
        : Environment.GetEnvironmentVariable("OPENAI_MODEL")?.Trim() ?? "gpt-3.5-turbo";

    var mode = string.IsNullOrWhiteSpace(request.Mode) ? "general" : request.Mode.Trim().ToLowerInvariant();
    string? context = null;

    if (mode == "branch")
    {
        context = await branchDataService.BuildBranchContextAsync(request.Message.Trim());
    }
    else if (mode == "itsupport")
    {
        context = await itSupportService.FindSolutionAsync(request.Message.Trim());
    }

    string? fileContext = uploadService.HasFiles() ? uploadService.GetCombinedContent() : null;
    var combinedContext = string.IsNullOrWhiteSpace(context)
        ? fileContext
        : string.IsNullOrWhiteSpace(fileContext)
            ? context
            : $"{context}\n\n{fileContext}";

    var responseText = await openAiService.GetChatResponseAsync(request.Message.Trim(), model, mode, combinedContext);
    return Results.Json(new ChatResponse(responseText));
});

app.MapPost("/search", async (SearchRequest request, AppDbContext db) =>
{
    if (request is null || string.IsNullOrWhiteSpace(request.Query))
    {
        return Results.BadRequest(new { error = "Please enter a search query." });
    }

    var query = request.Query.Trim().ToLowerInvariant();

    var tickets = await db.ITSupportTickets
        .Include(t => t.Branch)
        .Where(t => t.Question.ToLower().Contains(query) || t.Solution.ToLower().Contains(query))
        .OrderBy(t => t.OrderNumber)
        .Select(t => new ITSupportTicketWithBranch(
            t.OrderNumber,
            t.Question,
            t.Solution,
            t.Branch != null ? new BranchInfo(
                t.Branch.Name,
                t.Branch.Category,
                t.Branch.Location,
                t.Branch.Contact) : null))
        .ToListAsync();

    return Results.Json(new SearchResponse(tickets.ToArray()));
});

app.MapGet("/suggestions", async (string? q, AppDbContext db) =>
{
    var query = (q ?? "").Trim().ToLowerInvariant();

    var suggestions = await db.ITSupportTickets
        .Where(t => string.IsNullOrEmpty(query) || t.Question.ToLower().Contains(query))
        .OrderBy(t => t.OrderNumber)
        .Take(10)
        .Select(t => t.Question)
        .ToListAsync();

    return Results.Json(new { suggestions });
});

app.MapGet("/branches", async (AppDbContext db) =>
{
    var branches = await db.Branches
        .OrderBy(b => b.Id)
        .Select(b => new { id = b.Id, name = b.Name })
        .ToListAsync();

    return Results.Json(new { branches });
});

app.MapPost("/tickets", async (CreateTicketRequest request, AppDbContext db) =>
{
    if (request is null || string.IsNullOrWhiteSpace(request.Description))
    {
        return Results.BadRequest(new { error = "Ticket description is required." });
    }

    if (!await db.Branches.AnyAsync(b => b.Id == request.BranchId))
    {
        return Results.BadRequest(new { error = "Please select a valid branch for the ticket." });
    }

    var nextOrderNumber = await db.ITSupportTickets.AnyAsync()
        ? await db.ITSupportTickets.MaxAsync(t => t.OrderNumber) + 1
        : 1001;

    var solutionText = string.IsNullOrWhiteSpace(request.Solution)
        ? "No solution provided yet."
        : request.Solution.Trim();

    var ticket = new ITSupportTicket
    {
        OrderNumber = nextOrderNumber,
        Question = request.Description.Trim(),
        Solution = solutionText,
        BranchId = request.BranchId
    };

    db.ITSupportTickets.Add(ticket);
    await db.SaveChangesAsync();

    return Results.Json(new CreateTicketResponse(ticket.OrderNumber, $"Ticket #{ticket.OrderNumber} created successfully."));
});

app.MapGet("/api/tickets/count", async (AppDbContext db) =>
{
    var activeCount = await db.ITSupportTickets.CountAsync();
    return Results.Json(new { active = activeCount });
});

app.MapGet("/api/tickets", async (AppDbContext db) =>
{
    var tickets = await db.ITSupportTickets
        .Include(t => t.Branch)
        .OrderBy(t => t.OrderNumber)
        .Select(t => new
        {
            t.OrderNumber,
            t.Question,
            t.Solution,
            BranchName = t.Branch != null ? t.Branch.Name : null
        })
        .ToListAsync();
    return Results.Json(new { tickets });
});

app.MapGet("/api/users/count", async (AppDbContext db) =>
{
    var activeCount = await db.Users.CountAsync(u => u.IsActive);
    return Results.Json(new { activeUsers = activeCount });
});

app.MapGet("/api/dashboard-summary", async (AppDbContext db) =>
{
    var totalTickets = await db.ITSupportTickets.CountAsync();
    var activeUsers = await db.Users.CountAsync(u => u.IsActive);
    var activeProjects = await db.Projects.CountAsync();

    return Results.Json(new
    {
        totalTickets,
        activeTickets = totalTickets,
        activeUsers,
        activeProjects,
        averageResponse = "N/A",
        resolutionRate = "N/A"
    });
});

app.MapGet("/api/users", async (AppDbContext db) =>
{
    var users = await db.Users
        .Include(u => u.Branch)
        .OrderBy(u => u.LastName)
        .Select(u => new
        {
            u.Id,
            u.Username,
            u.Email,
            u.FirstName,
            u.LastName,
            u.Role,
            u.IsActive,
            u.CreatedAt,
            u.LastLoginAt,
            BranchName = u.Branch != null ? u.Branch.Name : null
        })
        .ToListAsync();

    return Results.Json(new { users });
});

app.MapPost("/api/users", async (User user, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.Email))
    {
        return Results.BadRequest(new { error = "Username and email are required." });
    }

    // Check if username or email already exists
    if (await db.Users.AnyAsync(u => u.Username == user.Username || u.Email == user.Email))
    {
        return Results.BadRequest(new { error = "Username or email already exists." });
    }

    user.CreatedAt = DateTime.UtcNow;
    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Json(new { success = true, userId = user.Id });
});

app.MapGet("/api/assets", async (AppDbContext db) =>
{
    var assets = await db.Assets
        .OrderBy(a => a.Name)
        .ToListAsync();

    return Results.Json(new { assets });
});

app.MapPost("/api/assets", async (Asset asset, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(asset.Name) || string.IsNullOrWhiteSpace(asset.Type))
    {
        return Results.BadRequest(new { error = "Asset name and type are required." });
    }

    db.Assets.Add(asset);
    await db.SaveChangesAsync();

    return Results.Json(new { success = true, assetId = asset.Id });
});

app.MapGet("/api/projects", async (AppDbContext db) =>
{
    var projects = await db.Projects
        .Include(p => p.Tasks)
        .OrderBy(p => p.StartDate)
        .ToListAsync();

    return Results.Json(new { projects });
});

app.MapPost("/api/projects", async (Project project, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(project.Name))
    {
        return Results.BadRequest(new { error = "Project name is required." });
    }

    project.StartDate = DateTime.UtcNow;
    db.Projects.Add(project);
    await db.SaveChangesAsync();

    return Results.Json(new { success = true, projectId = project.Id });
});

app.MapGet("/api/knowledge-base", async (AppDbContext db) =>
{
    var articles = await db.KnowledgeBaseArticles
        .Where(a => a.IsPublished)
        .OrderByDescending(a => a.CreatedAt)
        .ToListAsync();

    return Results.Json(new { articles });
});

app.MapPost("/api/knowledge-base", async (KnowledgeBaseArticle article, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(article.Title) || string.IsNullOrWhiteSpace(article.Content))
    {
        return Results.BadRequest(new { error = "Title and content are required." });
    }

    article.CreatedAt = DateTime.UtcNow;
    db.KnowledgeBaseArticles.Add(article);
    await db.SaveChangesAsync();

    return Results.Json(new { success = true, articleId = article.Id });
});

app.MapGet("/api/audit-logs", async (string? action, string? username, int? days, AppDbContext db) =>
{
    var query = db.AuditLogs.AsQueryable();

    if (!string.IsNullOrWhiteSpace(action))
    {
        query = query.Where(l => l.Action.Contains(action));
    }

    if (!string.IsNullOrWhiteSpace(username))
    {
        query = query.Where(l => l.Username.Contains(username));
    }

    if (days.HasValue)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-days.Value);
        query = query.Where(l => l.Timestamp >= cutoffDate);
    }

    var logs = await query
        .OrderByDescending(l => l.Timestamp)
        .Take(100)
        .ToListAsync();

    return Results.Json(new { logs });
});

app.MapGet("/api/system-metrics", async (AppDbContext db) =>
{
    var metrics = await db.SystemMetrics
        .OrderByDescending(m => m.Timestamp)
        .Take(50)
        .ToListAsync();

    return Results.Json(new { metrics });
});

app.MapPost("/api/system-metrics", async (SystemMetric metric, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(metric.MetricName))
    {
        return Results.BadRequest(new { error = "Metric name is required." });
    }

    metric.Timestamp = DateTime.UtcNow;
    db.SystemMetrics.Add(metric);
    await db.SaveChangesAsync();

    return Results.Json(new { success = true, metricId = metric.Id });
});

app.MapGet("/api/notifications", async (int? userId, bool? unreadOnly, AppDbContext db) =>
{
    var query = db.Notifications.AsQueryable();

    if (userId.HasValue)
    {
        query = query.Where(n => n.UserId == userId.Value);
    }

    if (unreadOnly == true)
    {
        query = query.Where(n => !n.IsRead);
    }

    var notifications = await query
        .OrderByDescending(n => n.CreatedAt)
        .Take(20)
        .ToListAsync();

    return Results.Json(new { notifications });
});

app.MapPost("/api/notifications/{id}/read", async (int id, AppDbContext db) =>
{
    var notification = await db.Notifications.FindAsync(id);
    if (notification == null)
    {
        return Results.NotFound(new { error = "Notification not found." });
    }

    notification.IsRead = true;
    notification.ReadAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Json(new { success = true });
});

app.Lifetime.ApplicationStarted.Register(() =>
{
    try
    {
        var server = app.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.Server.IServer>();
        var addressesFeature = server.Features.Get<Microsoft.AspNetCore.Hosting.Server.Features.IServerAddressesFeature>();
        var address = addressesFeature?.Addresses.FirstOrDefault() ?? "http://localhost:5000";
        var url = new Uri(new Uri(address), "dashboard.html").ToString();

        if (OperatingSystem.IsWindows())
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
        }
        else if (OperatingSystem.IsMacOS())
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("open", url) { UseShellExecute = true });
        }
        else if (OperatingSystem.IsLinux())
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("xdg-open", url) { UseShellExecute = true });
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to open browser: {ex.Message}");
    }
});

app.Run();

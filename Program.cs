using System.IO.Compression;
using Microsoft.EntityFrameworkCore;
using AIHelper.Data;
using AIHelper.Models;
using AIHelper.Services;

var builder = WebApplication.CreateBuilder(args);

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

app.MapGet("/", () => Results.Redirect("/index.html"));

app.Run();

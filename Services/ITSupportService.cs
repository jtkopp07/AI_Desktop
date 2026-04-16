using AIHelper.Data;
using AIHelper.Models;
using Microsoft.EntityFrameworkCore;

namespace AIHelper.Services;

public sealed class ITSupportService
{
    private readonly AppDbContext _dbContext;

    public ITSupportService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<string> FindSolutionAsync(string query)
    {
        var searchText = query.ToLowerInvariant();
        var tickets = await _dbContext.ITSupportTickets
            .Include(t => t.Branch)
            .AsNoTracking()
            .ToListAsync();

        var matches = tickets
            .Where(t => t.Question.Contains(searchText, StringComparison.InvariantCultureIgnoreCase))
            .ToList();

        if (!matches.Any())
        {
            return "No matching IT support tickets found in the database.";
        }

        var parts = matches.Select(t =>
            $"Order Number: {t.OrderNumber}\nBranch: {t.Branch?.Name ?? "Unknown"}\nCategory: {t.Branch?.Category ?? "Unknown"}\nQuestion: {t.Question}\nSolution: {t.Solution}\n");

        return string.Join("\n---\n", parts);
    }
}

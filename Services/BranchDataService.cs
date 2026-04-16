using AIHelper.Data;
using AIHelper.Models;
using Microsoft.EntityFrameworkCore;

namespace AIHelper.Services;

public sealed class BranchDataService
{
    private readonly AppDbContext _dbContext;

    public BranchDataService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<string> BuildBranchContextAsync(string prompt)
    {
        var searchText = prompt.ToLowerInvariant();
        var branches = await _dbContext.Branches.AsNoTracking().ToListAsync();

        var matches = branches
            .Where(b => b.Name.Contains(searchText, StringComparison.InvariantCultureIgnoreCase)
                        || b.Category.Contains(searchText, StringComparison.InvariantCultureIgnoreCase)
                        || b.Location.Contains(searchText, StringComparison.InvariantCultureIgnoreCase)
                        || b.Description.Contains(searchText, StringComparison.InvariantCultureIgnoreCase))
            .ToList();

        if (!matches.Any())
        {
            return "No matching branch records found in the database.";
        }

        var context = string.Join("\n\n", matches.Select(b =>
            $"Branch: {b.Name}\nCategory: {b.Category}\nLocation: {b.Location}\nDescription: {b.Description}\nEmployees: {b.Employees}\nContact: {b.Contact}"));

        return $"Relevant branch information:\n\n{context}";
    }
}

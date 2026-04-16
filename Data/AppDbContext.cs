using AIHelper.Models;
using Microsoft.EntityFrameworkCore;

namespace AIHelper.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<ITSupportTicket> ITSupportTickets => Set<ITSupportTicket>();
}

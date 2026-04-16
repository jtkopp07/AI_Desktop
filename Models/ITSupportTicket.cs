using System.ComponentModel.DataAnnotations;

namespace AIHelper.Models;

public class ITSupportTicket
{
    [Key]
    public int OrderNumber { get; set; } // Primary Key
    public string Question { get; set; } = null!;
    public string Solution { get; set; } = null!;
    public int BranchId { get; set; }
    public Branch? Branch { get; set; }
}
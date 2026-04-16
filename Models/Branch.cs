namespace AIHelper.Models;

public class Branch
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Category { get; set; } = null!;
    public string Location { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Employees { get; set; }
    public string Contact { get; set; } = null!;
}

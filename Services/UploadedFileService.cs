using System.Text;

namespace AIHelper.Services;

public sealed class UploadedFileService
{
    private readonly List<UploadedFileEntry> _files = new();
    private readonly object _sync = new();

    public void AddFile(string fileName, string content)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return;
        }

        lock (_sync)
        {
            _files.RemoveAll(f => string.Equals(f.FileName, fileName, StringComparison.OrdinalIgnoreCase));
            _files.Add(new UploadedFileEntry(fileName, content));
        }
    }

    public IReadOnlyList<UploadedFileEntry> GetFiles()
    {
        lock (_sync)
        {
            return _files.ToArray();
        }
    }

    public IEnumerable<string> GetFileNames()
    {
        lock (_sync)
        {
            return _files.Select(f => f.FileName).ToArray();
        }
    }

    public bool HasFiles()
    {
        lock (_sync)
        {
            return _files.Count > 0;
        }
    }

    public void ClearFiles()
    {
        lock (_sync)
        {
            _files.Clear();
        }
    }

    public string GetCombinedContent(int maxCharacters = 12000)
    {
        lock (_sync)
        {
            if (_files.Count == 0)
            {
                return string.Empty;
            }

            var builder = new StringBuilder();
            foreach (var file in _files)
            {
                builder.AppendLine($"Filename: {file.FileName}");
                builder.AppendLine("Content:");
                var content = file.Content;

                if (content.Length > 4000)
                {
                    builder.AppendLine(content[..4000]);
                    builder.AppendLine("... [truncated]");
                }
                else
                {
                    builder.AppendLine(content);
                }

                builder.AppendLine(new string('-', 60));

                if (builder.Length > maxCharacters)
                {
                    return builder.ToString()[..Math.Min(builder.Length, maxCharacters)] + "\n... [truncated]";
                }
            }

            return builder.ToString();
        }
    }
}

public sealed record UploadedFileEntry(string FileName, string Content);

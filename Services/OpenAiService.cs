using AIHelper.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace AIHelper.Services;

public sealed class OpenAiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public OpenAiService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string> GetChatResponseAsync(string prompt, string model, string mode, string? context)
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return "OpenAI API key is not configured. Set OPENAI_API_KEY in your environment.";
        }

        using var httpClient = _httpClientFactory.CreateClient();
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var systemMessage = mode == "branch"
            ? "You are a helpful assistant. Use the branch data provided below to answer the user's question accurately and professionally. If no matching branch record is available, explain that the database did not contain a relevant entry but still answer as fully as possible."
            : mode == "itsupport"
            ? "You are a helpful IT support assistant. Use the support ticket information provided below to answer the user's question. Provide clear, step-by-step solutions based on the available knowledge base."
            : "You are a helpful assistant. Answer the user's question clearly, concisely, and professionally.";

        var userContent = (mode == "branch" || mode == "itsupport") && !string.IsNullOrWhiteSpace(context)
            ? $"Context information:\n{context}\n\nUser question:\n{prompt}"
            : prompt;

        var payload = new OpenAiChatRequest(
            model,
            new[]
            {
                new OpenAiChatMessage("system", systemMessage),
                new OpenAiChatMessage("user", userContent)
            });

        var requestContent = new StringContent(JsonSerializer.Serialize(payload, _jsonOptions), Encoding.UTF8, "application/json");
        using var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions", requestContent);
        var responseText = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return $"AI service error: {response.StatusCode}. {responseText}";
        }

        try
        {
            var result = JsonSerializer.Deserialize<OpenAiChatResponse>(responseText, _jsonOptions);
            var aiText = result?.Choices is { Length: > 0 } && !string.IsNullOrWhiteSpace(result.Choices[0]?.Message?.Content)
                ? result.Choices[0]!.Message!.Content!.Trim()
                : null;

            return string.IsNullOrWhiteSpace(aiText)
                ? "The AI returned an empty response. Try again with a different prompt."
                : aiText!;
        }
        catch
        {
            return "Unable to parse AI response. Check your API key and model settings.";
        }
    }
}

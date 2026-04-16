using System.Text.Json.Serialization;

namespace AIHelper.Models;

public record ChatRequest(
    [property: JsonPropertyName("message")] string? Message,
    [property: JsonPropertyName("model")] string? Model,
    [property: JsonPropertyName("mode")] string? Mode,
    [property: JsonPropertyName("includeUploadedFiles")] bool IncludeUploadedFiles = false);

public record ChatResponse(
    [property: JsonPropertyName("response")] string Response);

public record SearchRequest(
    [property: JsonPropertyName("query")] string Query);

public record SearchResponse(
    [property: JsonPropertyName("tickets")] ITSupportTicketWithBranch[] Tickets);

public record CreateTicketRequest(
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("solution")] string? Solution,
    [property: JsonPropertyName("branchId")] int BranchId);

public record CreateTicketResponse(
    [property: JsonPropertyName("ticketNumber")] int TicketNumber,
    [property: JsonPropertyName("message")] string Message);

public record ITSupportTicketWithBranch(
    [property: JsonPropertyName("orderNumber")] int OrderNumber,
    [property: JsonPropertyName("question")] string Question,
    [property: JsonPropertyName("solution")] string Solution,
    [property: JsonPropertyName("branch")] BranchInfo? Branch);

public record BranchInfo(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("location")] string Location,
    [property: JsonPropertyName("contact")] string Contact);

public record OpenAiChatRequest(
    [property: JsonPropertyName("model")] string Model,
    [property: JsonPropertyName("messages")] OpenAiChatMessage[] Messages,
    [property: JsonPropertyName("max_tokens")] int MaxTokens = 600,
    [property: JsonPropertyName("temperature")] decimal Temperature = 0.8m);

public record OpenAiChatMessage(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("content")] string Content);

public record OpenAiChatResponse(
    [property: JsonPropertyName("choices")] OpenAiChoice[]? Choices);

public record OpenAiChoice(
    [property: JsonPropertyName("message")] OpenAiChatMessage? Message);

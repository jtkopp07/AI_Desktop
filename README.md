# AIHelper

AIHelper is a lightweight ASP.NET Core application that provides a polished AI chat interface powered by OpenAI.

## Features

- Modern responsive chat UI
- Three chat modes: General AI, Branch Data, and IT Support
- Branch database lookup for context-aware branch responses
- IT help desk database with order numbers, questions, and solutions categorized by branch
- Model selector for common OpenAI chat models
- Clean backend architecture with dependency injection
- SQLite database for persistent data storage
- Static web assets served from `wwwroot`
- Help text, status messaging, and conversation controls

## Requirements

- .NET 10 SDK
- An OpenAI API key set in the environment as `OPENAI_API_KEY`

## Run locally

```bash
export OPENAI_API_KEY="your_openai_api_key"
dotnet run
```

Then open `http://localhost:5000/search.html` in your browser.

### Optional model override

Set `OPENAI_MODEL` to change the server default, or choose a model in the UI.

## Project structure

- `Program.cs` — application startup, database seeding, and endpoint routing
- `Models/ChatModels.cs` — request/response models and OpenAI response types
- `Models/Branch.cs` — branch entity for database storage
- `Models/ITSupportTicket.cs` — IT support ticket entity with order numbers
- `Data/AppDbContext.cs` — Entity Framework Core database context
- `Services/OpenAiService.cs` — OpenAI client wrapper with mode-based context injection
- `Services/BranchDataService.cs` — branch data queries and context building
- `Services/ITSupportService.cs` — IT support ticket queries and solution matching
- `wwwroot/` — static web UI assets with tabbed interface

## Database

The app uses SQLite with Entity Framework Core. On first run, it automatically creates and seeds the database with sample company data and IT support tickets.

## Notes

- Your key is never embedded in the client; it stays server-side.
- The app uses a stable minimal API design to keep the project clean and easy to extend.
- Database-backed modes provide contextual AI responses based on stored knowledge.

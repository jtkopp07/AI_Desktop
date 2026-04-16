const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const clearButton = document.getElementById("clearButton");
const searchResults = document.getElementById("searchResults");
const statusText = document.getElementById("statusText");
const suggestionList = document.getElementById("suggestionList");

let suggestionsVisible = false;

function setLoading(isLoading) {
    searchButton.disabled = isLoading;
    searchInput.disabled = isLoading;
    statusText.textContent = isLoading ? "Searching..." : "Ready to search.";
}

function clearResults() {
    searchResults.innerHTML = `
        <div class="no-results">
            <p>Enter a search term above to find IT support tickets.</p>
        </div>
    `;
    statusText.textContent = "Results cleared.";
}

function displayResults(tickets) {
    if (!tickets || tickets.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <p>No IT support tickets found matching your search.</p>
            </div>
        `;
        statusText.textContent = "No results found.";
        return;
    }

    const resultsHtml = tickets.map(ticket => `
        <div class="ticket-card">
            <div class="ticket-header">
                <span class="ticket-number">Ticket #${ticket.orderNumber}</span>
                <span class="branch-name">${ticket.branch?.name || 'Unknown Branch'}</span>
            </div>
            <div class="ticket-content">
                <div class="question">
                    <strong>Question:</strong> ${ticket.question}
                </div>
                <div class="solution">
                    <strong>Solution:</strong> ${ticket.solution}
                </div>
                ${ticket.branch ? `
                <div class="branch-info">
                    <strong>Branch:</strong> ${ticket.branch.name} (${ticket.branch.category})
                    <br><strong>Location:</strong> ${ticket.branch.location}
                    <br><strong>Contact:</strong> ${ticket.branch.contact}
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    searchResults.innerHTML = resultsHtml;
    statusText.textContent = `Found ${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}.`;
}

function displaySuggestions(suggestions, query = "") {
    if (!suggestions || suggestions.length === 0) {
        if (query.length > 0) {
            suggestionList.innerHTML = '<p>No matching suggestions found.</p>';
        } else {
            suggestionList.innerHTML = '<p>Start typing to see suggestions...</p>';
        }
        return;
    }

    const suggestionsHtml = suggestions.map(suggestion => {
        // Highlight matching text
        const highlightedSuggestion = query.length > 0 
            ? suggestion.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>')
            : suggestion;
            
        return `
            <div class="suggestion-item" data-question="${suggestion}">
                <span class="suggestion-text">${highlightedSuggestion}</span>
                <button class="suggestion-use" title="Use this question">→</button>
            </div>
        `;
    }).join('');

    suggestionList.innerHTML = suggestionsHtml;

    // Add click handlers for suggestions
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const question = item.dataset.question;
            searchInput.value = question;
            hideSuggestions();
            performSearch();
        });
    });
}

function showSuggestions() {
    if (!suggestionsVisible) {
        document.getElementById('suggestions').style.display = 'block';
        suggestionsVisible = true;
    }
}

function hideSuggestions() {
    if (suggestionsVisible) {
        document.getElementById('suggestions').style.display = 'none';
        suggestionsVisible = false;
    }
}

async function loadSuggestions(query = "") {
    try {
        const url = query.length > 0 ? `/suggestions?q=${encodeURIComponent(query)}` : '/suggestions';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        const data = await response.json();
        displaySuggestions(data.suggestions, query);
        showSuggestions();
    } catch (error) {
        suggestionList.innerHTML = '<p>Unable to load suggestions.</p>';
        console.error(error);
    }
}

async function performSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        statusText.textContent = "Enter a search term before searching.";
        return;
    }

    hideSuggestions();
    setLoading(true);

    try {
        const response = await fetch("/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        displayResults(data.tickets);
    } catch (error) {
        searchResults.innerHTML = `
            <div class="error">
                <p>There was an error searching the database. Please try again.</p>
            </div>
        `;
        statusText.textContent = "Search failed.";
        console.error(error);
    } finally {
        setLoading(false);
    }
}

function handleInput(event) {
    const query = event.target.value.trim();
    
    if (query.length > 0) {
        loadSuggestions(query);
    } else {
        loadSuggestions();
    }
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        performSearch();
    } else if (event.key === "Escape") {
        hideSuggestions();
    }
}

function handleFocus() {
    if (searchInput.value.trim().length === 0) {
        loadSuggestions();
    }
}

function handleClickOutside(event) {
    const suggestions = document.getElementById('suggestions');
    const searchBar = document.querySelector('.search-bar');
    
    if (!suggestions.contains(event.target) && !searchBar.contains(event.target)) {
        hideSuggestions();
    }
}

// Event listeners
searchButton.addEventListener("click", performSearch);
clearButton.addEventListener("click", () => {
    clearResults();
    searchInput.value = "";
    loadSuggestions();
});
searchInput.addEventListener("keydown", handleKeyPress);
searchInput.addEventListener("input", handleInput);
searchInput.addEventListener("focus", handleFocus);
document.addEventListener("click", handleClickOutside);

// Initialize
clearResults();
loadSuggestions();
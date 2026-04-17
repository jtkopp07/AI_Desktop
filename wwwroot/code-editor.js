// Code Editor JavaScript

let currentFile = 'main.py';
let files = {
    'main.py': `# Welcome to AIHelper Code Editor
# This is a powerful coding environment with syntax highlighting,
# code execution, and collaboration features.

def hello_world():
    print("Hello, World!")
    return "Welcome to AIHelper!"

if __name__ == "__main__":
    result = hello_world()
    print(f"Result: {result}")`,

    'utils.py': `# Utility functions for AIHelper

def calculate_fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

def format_number(num, decimals=2):
    """Format a number with specified decimal places."""
    return f"{num:.{decimals}f}"

def validate_email(email):
    """Basic email validation."""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# Example usage
if __name__ == "__main__":
    print(f"Fibonacci 10: {calculate_fibonacci(10)}")
    print(f"Formatted: {format_number(3.14159, 3)}")
    print(f"Valid email: {validate_email('test@example.com')}")`,

    'config.json': `{
  "app": {
    "name": "AIHelper",
    "version": "2.0.0",
    "environment": "development"
  },
  "database": {
    "type": "sqlite",
    "connectionString": "Data Source=aihelper.db"
  },
  "ai": {
    "provider": "openai",
    "model": "gpt-4",
    "maxTokens": 2000
  },
  "features": {
    "codeEditor": true,
    "apiTester": true,
    "databaseQuery": true,
    "fileUpload": true
  }
}`,

    'README.md': `# AIHelper Enterprise

A comprehensive IT support and development platform built with ASP.NET Core.

## Features

- 🤖 AI-powered support system
- 🎫 Advanced ticket management
- 💻 Integrated code editor
- 🗄️ Database query interface
- 🔧 System administration tools
- 📊 Analytics and reporting
- 👥 Team collaboration
- 🔒 Security and compliance

## Getting Started

1. Clone the repository
2. Run \`dotnet restore\`
3. Set your OpenAI API key
4. Run \`dotnet run\`
5. Open http://localhost:5000/dashboard.html

## API Endpoints

- \`GET /health\` - Health check
- \`POST /submit\` - AI chat
- \`POST /upload\` - File upload
- \`GET /search\` - Ticket search
- \`POST /tickets\` - Create ticket

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License.`
};

document.addEventListener('DOMContentLoaded', function() {
    loadFile(currentFile);
    loadSnippets();
    setupEventListeners();
});

function setupEventListeners() {
    // Language change
    document.getElementById('languageSelect').addEventListener('change', function(e) {
        updateSyntaxHighlighting(e.target.value);
    });

    // Theme change
    document.getElementById('themeSelect').addEventListener('change', function(e) {
        changeTheme(e.target.value);
    });

    // Auto-save
    let saveTimeout;
    document.getElementById('codeEditor').addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            autoSave();
        }, 1000);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    saveFile();
                    break;
                case 'Enter':
                    if (e.shiftKey) {
                        e.preventDefault();
                        runCode();
                    }
                    break;
            }
        }
    });
}

function selectFile(filename) {
    // Save current file
    saveCurrentFile();

    // Update UI
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load new file
    currentFile = filename;
    loadFile(filename);
}

function loadFile(filename) {
    const editor = document.getElementById('codeEditor');
    const languageSelect = document.getElementById('languageSelect');

    editor.value = files[filename] || '';

    // Set language based on file extension
    const extension = filename.split('.').pop().toLowerCase();
    const languageMap = {
        'py': 'python',
        'js': 'javascript',
        'java': 'java',
        'cs': 'csharp',
        'cpp': 'cpp',
        'c': 'cpp',
        'html': 'html',
        'css': 'css',
        'sql': 'sql',
        'json': 'json',
        'md': 'markdown'
    };

    languageSelect.value = languageMap[extension] || 'python';
    updateSyntaxHighlighting(languageSelect.value);
}

function saveCurrentFile() {
    const editor = document.getElementById('codeEditor');
    files[currentFile] = editor.value;
}

function saveFile() {
    saveCurrentFile();
    showNotification('File saved successfully!', 'success');
}

function autoSave() {
    saveCurrentFile();
    showNotification('Auto-saved', 'info');
}

async function runCode() {
    const code = document.getElementById('codeEditor').value;
    const language = document.getElementById('languageSelect').value;
    const outputArea = document.getElementById('outputArea');

    outputArea.textContent = 'Running code...\n';

    try {
        if (language === 'python') {
            await runPythonCode(code);
        } else if (language === 'javascript') {
            await runJavaScriptCode(code);
        } else {
            outputArea.textContent += `Code execution for ${language} not yet implemented.\n`;
            outputArea.textContent += 'Supported languages: Python, JavaScript\n';
        }
    } catch (error) {
        outputArea.textContent += `Error: ${error.message}\n`;
    }
}

async function runPythonCode(code) {
    const outputArea = document.getElementById('outputArea');

    try {
        // Use the Python execution endpoint if available, otherwise simulate
        const response = await fetch('/api/execute-python', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });

        if (response.ok) {
            const result = await response.json();
            outputArea.textContent += result.output || 'Code executed successfully\n';
        } else {
            // Fallback: simulate Python execution for demo
            simulatePythonExecution(code);
        }
    } catch (error) {
        simulatePythonExecution(code);
    }
}

function simulatePythonExecution(code) {
    const outputArea = document.getElementById('outputArea');
    outputArea.textContent += 'Python execution simulated:\n';

    // Simple simulation - look for print statements
    const lines = code.split('\n');
    for (const line of lines) {
        if (line.includes('print(')) {
            const match = line.match(/print\((.*?)\)/);
            if (match) {
                let output = match[1];
                // Remove quotes
                output = output.replace(/^["']|["']$/g, '');
                outputArea.textContent += `${output}\n`;
            }
        }
    }

    if (!code.includes('print(')) {
        outputArea.textContent += 'No print statements found. Add print() to see output.\n';
    }
}

async function runJavaScriptCode(code) {
    const outputArea = document.getElementById('outputArea');

    try {
        // Create a new function from the code and execute it
        const result = new Function(code)();
        outputArea.textContent += `Result: ${result}\n`;
    } catch (error) {
        outputArea.textContent += `JavaScript Error: ${error.message}\n`;
    }
}

function formatCode() {
    const editor = document.getElementById('codeEditor');
    const language = document.getElementById('languageSelect').value;

    // Basic formatting
    let formatted = editor.value;

    if (language === 'python') {
        formatted = formatPythonCode(formatted);
    } else if (language === 'javascript') {
        formatted = formatJavaScriptCode(formatted);
    } else if (language === 'json') {
        try {
            formatted = JSON.stringify(JSON.parse(formatted), null, 2);
        } catch (e) {
            showNotification('Invalid JSON format', 'error');
            return;
        }
    }

    editor.value = formatted;
    showNotification('Code formatted', 'success');
}

function formatPythonCode(code) {
    // Basic Python formatting
    let formatted = code;
    // Add proper indentation (simplified)
    formatted = formatted.replace(/^/gm, '    ').replace(/^    $/gm, '');
    return formatted;
}

function formatJavaScriptCode(code) {
    // Basic JavaScript formatting
    return code; // Placeholder
}

function updateSyntaxHighlighting(language) {
    const editor = document.getElementById('codeEditor');
    // This would require a syntax highlighting library in a real implementation
    // For now, just change the placeholder
    const placeholders = {
        python: '# Write your Python code here...',
        javascript: '// Write your JavaScript code here...',
        java: '// Write your Java code here...',
        csharp: '// Write your C# code here...',
        html: '<!-- Write your HTML here -->',
        css: '/* Write your CSS here */',
        sql: '-- Write your SQL here',
        json: '// Write your JSON here',
        markdown: '<!-- Write your Markdown here -->'
    };

    if (!editor.value.trim()) {
        editor.placeholder = placeholders[language] || 'Write your code here...';
    }
}

function changeTheme(theme) {
    const editor = document.getElementById('codeEditor');

    if (theme === 'light') {
        editor.style.background = '#ffffff';
        editor.style.color = '#000000';
    } else {
        editor.style.background = '#1e1e1e';
        editor.style.color = '#d4d4d4';
    }
}

function clearOutput() {
    document.getElementById('outputArea').textContent = 'Output cleared.\n';
}

function downloadOutput() {
    const output = document.getElementById('outputArea').textContent;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code-output.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function shareCode() {
    const code = document.getElementById('codeEditor').value;
    const language = document.getElementById('languageSelect').value;

    // Create a shareable link (simplified)
    const shareData = {
        code: btoa(code),
        language: language,
        timestamp: Date.now()
    };

    const shareUrl = `${window.location.origin}/shared-code.html?id=${btoa(JSON.stringify(shareData))}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('Share link copied to clipboard!', 'success');
    });
}

function loadSnippets() {
    const snippets = [
        {
            title: 'Hello World',
            description: 'Basic hello world program',
            code: 'print("Hello, World!")',
            language: 'python'
        },
        {
            title: 'HTTP Request',
            description: 'Make an HTTP GET request',
            code: `import requests
response = requests.get('https://api.example.com/data')
print(response.json())`,
            language: 'python'
        },
        {
            title: 'Database Query',
            description: 'Query SQLite database',
            code: `import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM users')
results = cursor.fetchall()
print(results)
conn.close()`,
            language: 'python'
        },
        {
            title: 'File Operations',
            description: 'Read and write files',
            code: `# Read file
with open('file.txt', 'r') as f:
    content = f.read()
    print(content)

# Write file
with open('output.txt', 'w') as f:
    f.write('Hello, file!')`,
            language: 'python'
        }
    ];

    const grid = document.getElementById('snippetGrid');
    grid.innerHTML = '';

    snippets.forEach(snippet => {
        const card = document.createElement('div');
        card.className = 'snippet-card';
        card.onclick = () => loadSnippet(snippet);

        card.innerHTML = `
            <div class="snippet-title">${snippet.title}</div>
            <div class="snippet-desc">${snippet.description}</div>
        `;

        grid.appendChild(card);
    });
}

function loadSnippet(snippet) {
    document.getElementById('languageSelect').value = snippet.language;
    document.getElementById('codeEditor').value = snippet.code;
    updateSyntaxHighlighting(snippet.language);
    showNotification(`Loaded snippet: ${snippet.title}`, 'info');
}

function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };

    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
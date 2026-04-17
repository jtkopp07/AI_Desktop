// API Tester JavaScript

let requestHistory = [];

document.addEventListener('DOMContentLoaded', function() {
    loadRequestHistory();
    setupEventListeners();
});

function setupEventListeners() {
    // Auto-format JSON in textarea
    document.getElementById('requestBody').addEventListener('blur', formatJson);

    // Enter key in endpoint input
    document.getElementById('endpoint').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendRequest();
        }
    });
}

async function sendRequest() {
    const method = document.getElementById('method').value;
    const endpoint = document.getElementById('endpoint').value.trim();
    const bodyText = document.getElementById('requestBody').value.trim();

    if (!endpoint) {
        showNotification('Please enter an endpoint', 'error');
        return;
    }

    const startTime = Date.now();

    try {
        let body = null;
        if (bodyText && (method === 'POST' || method === 'PUT')) {
            try {
                body = JSON.parse(bodyText);
            } catch (e) {
                showNotification('Invalid JSON in request body', 'error');
                return;
            }
        }

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : null
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        let responseBody;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseBody = await response.json();
        } else {
            responseBody = await response.text();
        }

        displayResponse(response.status, responseTime, responseBody);

        // Add to history
        addToHistory({
            method,
            endpoint,
            status: response.status,
            time: responseTime,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        displayResponse(0, responseTime, { error: error.message });
        showNotification('Request failed: ' + error.message, 'error');
    }
}

function displayResponse(statusCode, responseTime, responseBody) {
    document.getElementById('statusCode').textContent = `Status: ${statusCode}`;
    document.getElementById('responseTime').textContent = `Time: ${responseTime}ms`;

    const responseElement = document.getElementById('responseBody');

    if (typeof responseBody === 'object') {
        responseElement.textContent = JSON.stringify(responseBody, null, 2);
        responseElement.className = 'json-response';
    } else {
        responseElement.textContent = responseBody;
        responseElement.className = 'text-response';
    }

    // Color code status
    const statusElement = document.getElementById('statusCode');
    statusElement.className = 'status-code';

    if (statusCode >= 200 && statusCode < 300) {
        statusElement.classList.add('status-success');
    } else if (statusCode >= 400) {
        statusElement.classList.add('status-error');
    } else {
        statusElement.classList.add('status-warning');
    }
}

function addToHistory(request) {
    requestHistory.unshift(request);

    // Keep only last 10 requests
    if (requestHistory.length > 10) {
        requestHistory = requestHistory.slice(0, 10);
    }

    saveRequestHistory();
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('requestHistory');
    container.innerHTML = '';

    if (requestHistory.length === 0) {
        container.innerHTML = '<div class="no-history">No requests yet</div>';
        return;
    }

    requestHistory.forEach((request, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.onclick = () => loadFromHistory(request);

        const statusClass = request.status >= 200 && request.status < 300 ? 'status-success' :
                           request.status >= 400 ? 'status-error' : 'status-warning';

        historyItem.innerHTML = `
            <div class="history-method">${request.method}</div>
            <div class="history-endpoint">${request.endpoint}</div>
            <div class="history-status ${statusClass}">${request.status}</div>
            <div class="history-time">${request.time}ms</div>
            <div class="history-timestamp">${new Date(request.timestamp).toLocaleTimeString()}</div>
        `;

        container.appendChild(historyItem);
    });
}

function loadFromHistory(request) {
    document.getElementById('method').value = request.method;
    document.getElementById('endpoint').value = request.endpoint;
}

function loadRequestHistory() {
    const saved = localStorage.getItem('apiTesterHistory');
    if (saved) {
        try {
            requestHistory = JSON.parse(saved);
            renderHistory();
        } catch (e) {
            console.error('Error loading request history:', e);
        }
    }
}

function saveRequestHistory() {
    try {
        localStorage.setItem('apiTesterHistory', JSON.stringify(requestHistory));
    } catch (e) {
        console.error('Error saving request history:', e);
    }
}

function clearResults() {
    document.getElementById('statusCode').textContent = 'Status: -';
    document.getElementById('responseTime').textContent = 'Time: -';
    document.getElementById('responseBody').textContent = 'No response yet';
    document.getElementById('responseBody').className = '';
}

function formatJson() {
    const textarea = document.getElementById('requestBody');
    const text = textarea.value.trim();

    if (!text) return;

    try {
        const parsed = JSON.parse(text);
        textarea.value = JSON.stringify(parsed, null, 2);
    } catch (e) {
        // Invalid JSON, leave as is
    }
}

function showNotification(message, type = 'info') {
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
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };

    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Quick endpoint fillers
function fillEndpoint(endpoint) {
    document.getElementById('endpoint').value = endpoint;
}

// Add some sample request bodies for common endpoints
const sampleBodies = {
    '/api/users': {
        "username": "newuser",
        "email": "newuser@company.com",
        "firstName": "New",
        "lastName": "User",
        "role": "User"
    },
    '/api/assets': {
        "name": "New Asset",
        "type": "Hardware",
        "description": "A new piece of equipment",
        "location": "Office A",
        "status": "Active"
    },
    '/api/projects': {
        "name": "New Project",
        "description": "A new project description",
        "status": "Planning",
        "priority": "Medium"
    },
    '/api/knowledge-base': {
        "title": "New Article",
        "content": "Article content here...",
        "category": "General",
        "tags": ["help", "guide"]
    }
};

// Auto-fill request body when endpoint changes
document.getElementById('endpoint').addEventListener('input', function() {
    const endpoint = this.value;
    const sampleBody = sampleBodies[endpoint];

    if (sampleBody && !document.getElementById('requestBody').value.trim()) {
        document.getElementById('requestBody').value = JSON.stringify(sampleBody, null, 2);
    }
});
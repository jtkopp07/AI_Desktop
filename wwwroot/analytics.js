// Analytics Dashboard JavaScript

let currentTimeFilter = '24h';

document.addEventListener('DOMContentLoaded', function() {
    loadAnalyticsData();
    loadReports();
    setupEventListeners();
});

function setupEventListeners() {
    // Time filter buttons
    document.querySelectorAll('.time-filter').forEach(button => {
        button.addEventListener('click', function() {
            setTimeFilter(this.getAttribute('onclick').match(/'([^']+)'/)[1]);
        });
    });
}

function setTimeFilter(filter, event) {
    currentTimeFilter = filter;

    // Update active button
    document.querySelectorAll('.time-filter').forEach(button => {
        button.classList.remove('active');
    });
    if (event?.target) {
        event.target.classList.add('active');
    }

    // Reload data with new filter
    loadAnalyticsData();
}

async function loadAnalyticsData() {
    try {
        // Load ticket data
        const ticketResponse = await fetch('/api/tickets');
        if (ticketResponse.ok) {
            const ticketData = await ticketResponse.json();
            updateTicketMetrics(ticketData.tickets || []);
        }

        // Load system metrics (simulated for now)
        updateSystemMetrics();

        // Load user activity (simulated)
        updateUserMetrics();

        // Load performance data (simulated)
        updatePerformanceMetrics();

    } catch (error) {
        console.error('Error loading analytics data:', error);
        showError('Failed to load analytics data');
    }
}

function updateTicketMetrics(tickets) {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => getTicketStatus(t) === 'open').length;
    const resolvedTickets = tickets.filter(t => getTicketStatus(t) === 'resolved').length;

    document.getElementById('totalTicketsMetric').textContent = totalTickets;

    // Calculate change (simulated)
    const changePercent = Math.floor(Math.random() * 20) - 10; // -10% to +10%
    const changeElement = document.getElementById('ticketsChange');
    changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent}% from last period`;
    changeElement.className = `metric-change ${changePercent >= 0 ? 'positive' : 'negative'}`;
}

function getTicketStatus(ticket) {
    const solution = (ticket.solution || ticket.Solution || '').toLowerCase();
    if (solution.includes('no solution provided')) {
        return 'open';
    } else if (solution.includes('in progress')) {
        return 'in-progress';
    } else {
        return 'resolved';
    }
}

function updateSystemMetrics() {
    // Simulated system metrics
    const performance = (95 + Math.random() * 5).toFixed(1);
    document.getElementById('performanceMetric').textContent = `${performance}%`;

    const perfChange = (Math.random() * 2 - 1).toFixed(1);
    const perfElement = document.getElementById('performanceChange');
    perfElement.textContent = `${perfChange >= 0 ? '+' : ''}${perfChange}% from last period`;
    perfElement.className = `metric-change ${perfChange >= 0 ? 'positive' : 'negative'}`;

    const responseTime = (1.5 + Math.random() * 2).toFixed(1);
    document.getElementById('responseTimeMetric').textContent = `${responseTime}s`;

    const responseChange = (Math.random() * 1 - 0.5).toFixed(1);
    const responseElement = document.getElementById('responseChange');
    responseElement.textContent = `${responseChange >= 0 ? '+' : ''}${responseChange}s from last period`;
    responseElement.className = `metric-change ${responseChange >= 0 ? 'positive' : 'negative'}`;
}

function updateUserMetrics() {
    const activeUsers = Math.floor(Math.random() * 50) + 10;
    document.getElementById('activeUsersMetric').textContent = activeUsers;

    const userChange = Math.floor(Math.random() * 20) - 5;
    const userElement = document.getElementById('usersChange');
    userElement.textContent = `${userChange >= 0 ? '+' : ''}${userChange}% from last period`;
    userElement.className = `metric-change ${userChange >= 0 ? 'positive' : 'negative'}`;
}

function updatePerformanceMetrics() {
    const executions = Math.floor(Math.random() * 1000) + 100;
    document.getElementById('codeExecutionsMetric').textContent = executions;

    const execChange = Math.floor(Math.random() * 50) - 10;
    const execElement = document.getElementById('executionsChange');
    execElement.textContent = `${execChange >= 0 ? '+' : ''}${execChange}% from last period`;
    execElement.className = `metric-change ${execChange >= 0 ? 'positive' : 'negative'}`;

    const queries = Math.floor(Math.random() * 5000) + 500;
    document.getElementById('dbQueriesMetric').textContent = queries.toLocaleString();

    const queryChange = Math.floor(Math.random() * 30) - 5;
    const queryElement = document.getElementById('queriesChange');
    queryElement.textContent = `${queryChange >= 0 ? '+' : ''}${queryChange}% from last period`;
    queryElement.className = `metric-change ${queryChange >= 0 ? 'positive' : 'negative'}`;
}

function loadReports() {
    const reports = [
        {
            title: 'IT Support Report',
            description: 'Comprehensive overview of all IT support tickets and resolutions',
            type: 'support',
            lastGenerated: '2 hours ago',
            records: '247 tickets'
        },
        {
            title: 'System Performance Report',
            description: 'Server performance metrics, response times, and resource usage',
            type: 'performance',
            lastGenerated: '1 hour ago',
            records: '24 hours of data'
        },
        {
            title: 'User Activity Report',
            description: 'User login patterns, feature usage, and engagement metrics',
            type: 'user',
            lastGenerated: '30 minutes ago',
            records: '1,234 sessions'
        },
        {
            title: 'Security Audit Report',
            description: 'Security events, access attempts, and compliance status',
            type: 'security',
            lastGenerated: '6 hours ago',
            records: '89 events'
        },
        {
            title: 'Code Quality Report',
            description: 'Code execution statistics, error rates, and performance metrics',
            type: 'code',
            lastGenerated: '4 hours ago',
            records: '156 executions'
        },
        {
            title: 'Database Usage Report',
            description: 'Database query patterns, performance, and optimization opportunities',
            type: 'database',
            lastGenerated: '3 hours ago',
            records: '2,847 queries'
        },
        {
            title: 'Asset Management Report',
            description: 'Hardware and software asset inventory and lifecycle status',
            type: 'asset',
            lastGenerated: '1 day ago',
            records: '342 assets'
        },
        {
            title: 'Project Status Report',
            description: 'Project progress, milestones, and resource allocation',
            type: 'project',
            lastGenerated: '12 hours ago',
            records: '23 projects'
        }
    ];

    const grid = document.getElementById('reportsGrid');
    grid.innerHTML = '';

    reports.forEach(report => {
        const card = document.createElement('div');
        card.className = 'report-card';
        card.onclick = () => generateReport(report.type);

        card.innerHTML = `
            <div class="report-title">${report.title}</div>
            <div class="report-desc">${report.description}</div>
            <div class="report-meta">
                📊 ${report.records} • 🕒 ${report.lastGenerated}
            </div>
        `;

        grid.appendChild(card);
    });
}

function generateReport(reportType) {
    showNotification(`Generating ${reportType} report...`, 'info');

    // Simulate report generation
    setTimeout(() => {
        showNotification(`${reportType} report generated successfully!`, 'success');
        // In a real app, this would open/download the report
    }, 2000);
}

function exportReport(format) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `aihelper-analytics-${timestamp}.${format}`;

    showNotification(`Exporting analytics data as ${format.toUpperCase()}...`, 'info');

    // Simulate export
    setTimeout(() => {
        // Create sample data for export
        let data, mimeType;

        switch(format) {
            case 'csv':
                data = 'Metric,Value,Change\nTotal Tickets,247,+12%\nSystem Performance,98.5%,+0.5%\nActive Users,42,+8%';
                mimeType = 'text/csv';
                break;
            case 'json':
                data = JSON.stringify({
                    timestamp: new Date().toISOString(),
                    metrics: {
                        totalTickets: 247,
                        systemPerformance: 98.5,
                        activeUsers: 42
                    }
                }, null, 2);
                mimeType = 'application/json';
                break;
            case 'pdf':
                showNotification('PDF export feature coming soon!', 'warning');
                return;
        }

        if (data) {
            const blob = new Blob([data], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            showNotification(`Analytics data exported as ${format.toUpperCase()}!`, 'success');
        }
    }, 1500);
}

function scheduleReport() {
    const scheduleOptions = [
        'Daily at 9:00 AM',
        'Weekly on Monday',
        'Monthly on 1st',
        'Quarterly'
    ];

    const selected = prompt(`Choose schedule frequency:\n${scheduleOptions.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);

    if (selected && selected >= 1 && selected <= scheduleOptions.length) {
        showNotification(`Report scheduled: ${scheduleOptions[selected - 1]}`, 'success');
    } else if (selected !== null) {
        showNotification('Invalid selection', 'error');
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #e74c3c;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #e74c3c;
        border-radius: 4px;
        background: #fdf2f2;
    `;

    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild.nextSibling);

    setTimeout(() => errorDiv.remove(), 5000);
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

// Auto-refresh analytics data every 5 minutes
setInterval(loadAnalyticsData, 300000);
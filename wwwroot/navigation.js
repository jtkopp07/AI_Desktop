// Common Navigation JavaScript for AIHelper

// Navigation function
function navigateTo(page) {
    console.log(`Navigating to: ${page}`);

    // Map page names to actual URLs
    const pageMap = {
        'dashboard': 'dashboard.html',
        'analytics': 'analytics.html',
        'reports': 'reports.html',
        'tickets': 'tickets.html',
        'create-ticket': 'create-ticket.html',
        'ticket-search': 'search.html',
        'ticket-analytics': 'ticket-analytics.html',
        'sla-monitoring': 'sla-monitoring.html',
        'code-editor': 'code-editor.html',
        'api-tester': 'api-tester.html',
        'database-query': 'database-query.html',
        'git-integration': 'git-integration.html',
        'code-review': 'code-review.html',
        'testing-tools': 'testing-tools.html',
        'user-management': 'user-management.html',
        'asset-management': 'asset-management.html',
        'backup-restore': 'backup-restore.html',
        'system-monitoring': 'system-monitoring.html',
        'security-audit': 'security-audit.html',
        'configuration': 'configuration.html',
        'performance-metrics': 'performance-metrics.html',
        'usage-statistics': 'usage-statistics.html',
        'trend-analysis': 'trend-analysis.html',
        'custom-reports': 'custom-reports.html',
        'data-visualization': 'data-visualization.html',
        'documentation': 'documentation.html',
        'faq': 'faq.html',
        'tutorials': 'tutorials.html',
        'best-practices': 'best-practices.html',
        'troubleshooting': 'troubleshooting.html',
        'team-chat': 'team-chat.html',
        'project-boards': 'project-boards.html',
        'file-sharing': 'file-sharing.html',
        'meeting-scheduler': 'meeting-scheduler.html',
        'task-management': 'task-management.html',
        'access-control': 'access-control.html',
        'audit-logs': 'audit-logs.html',
        'compliance': 'compliance.html',
        'threat-detection': 'threat-detection.html',
        'encryption-tools': 'encryption-tools.html',
        'calculator': 'calculator.html',
        'converter': 'converter.html',
        'scheduler': 'scheduler.html',
        'notepad': 'notepad.html',
        'bookmarks': 'bookmarks.html',
        'ai-chat': 'index.html'
    };

    const url = pageMap[page];
    if (url) {
        window.location.href = url;
    } else {
        // Create placeholder pages for features not yet implemented
        createPlaceholderPage(page);
    }
}

// Create placeholder pages for features not yet implemented
function createPlaceholderPage(feature) {
    const title = feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AIHelper | ${title}</title>
            <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>${title}</h1>
                        <p><a href="/dashboard.html">← Back to Dashboard</a></p>
                    </div>
                </header>
                <main>
                    <div class="placeholder-content">
                        <h2>🚧 ${title} - Coming Soon!</h2>
                        <p>This feature is currently under development. Check back soon for updates!</p>
                        <div class="feature-preview">
                            <h3>Planned Features:</h3>
                            <ul>
                                <li>Advanced functionality for ${title.toLowerCase()}</li>
                                <li>Integration with existing systems</li>
                                <li>User-friendly interface</li>
                                <li>Real-time updates</li>
                            </ul>
                        </div>
                        <div class="action-buttons">
                            <button onclick="window.location.href='/dashboard.html'" class="primary">Return to Dashboard</button>
                            <button onclick="window.history.back()" class="secondary">Go Back</button>
                        </div>
                    </div>
                </main>
            </div>
        </body>
        </html>
    `;

    // Create a blob and navigate to it
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
}
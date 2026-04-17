// AIHelper Enterprise Dashboard JavaScript

// Load dashboard data
async function loadDashboardData() {
    try {
        const summaryResponse = await fetch('/api/dashboard-summary');
        if (summaryResponse.ok) {
            const summary = await summaryResponse.json();
            document.getElementById('activeTickets').textContent = summary.activeTickets ?? 0;
            document.getElementById('totalTicketsValue').textContent = summary.totalTickets ?? 0;
            document.getElementById('resolutionRateValue').textContent = summary.resolutionRate ?? 'N/A';
            document.getElementById('avgResponseValue').textContent = summary.averageResponse ?? 'N/A';
            document.getElementById('activeProjectsValue').textContent = summary.activeProjects ?? 0;
            document.getElementById('onlineUsers').textContent = summary.activeUsers ?? 0;
        } else {
            console.warn('Dashboard summary fetch failed:', summaryResponse.status);
        }

        // Load system health
        const healthResponse = await fetch('/health');
        if (healthResponse.ok) {
            document.getElementById('systemHealth').textContent = '100%';
        }

        // Load recent activity
        loadRecentActivity();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load recent activity
function loadRecentActivity() {
    const activities = [
        { time: '2 min ago', desc: 'New ticket #1023 created' },
        { time: '5 min ago', desc: 'Code review completed for PR #45' },
        { time: '10 min ago', desc: 'System backup completed successfully' },
        { time: '15 min ago', desc: 'User authentication updated' },
        { time: '20 min ago', desc: 'Database optimization completed' }
    ];

    const activityList = document.getElementById('recentActivity');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <span class="activity-time">${activity.time}</span>
                <span class="activity-desc">${activity.desc}</span>
            </div>
        `).join('');
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'd':
                    e.preventDefault();
                    navigateTo('dashboard');
                    break;
                case 't':
                    e.preventDefault();
                    navigateTo('tickets');
                    break;
                case 'c':
                    e.preventDefault();
                    navigateTo('code-editor');
                    break;
            }
        }
    });

    // Add search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search features...';
    searchInput.className = 'feature-search';
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const navButtons = document.querySelectorAll('.nav-button');

        navButtons.forEach(button => {
            const text = button.textContent.toLowerCase();
            const section = button.closest('.nav-section');
            const sectionHeader = section.querySelector('h3').textContent.toLowerCase();

            if (text.includes(query) || sectionHeader.includes(query)) {
                button.style.display = 'block';
                section.style.display = 'block';
            } else {
                button.style.display = 'none';
            }
        });
    });

    // Insert search input at the top of navigation
    const nav = document.querySelector('.main-navigation');
    if (nav) {
        nav.insertBefore(searchInput, nav.firstChild);
    }
});

// Auto-refresh dashboard data every 30 seconds
setInterval(loadDashboardData, 30000);</content>
<parameter name="filePath">/Users/jackkopp/AIHelper/wwwroot/dashboard.js
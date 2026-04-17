// Ticket Management JavaScript

let allTickets = [];
let filteredTickets = [];

document.addEventListener('DOMContentLoaded', function() {
    loadTickets();
    loadBranches();
    setupEventListeners();
});

function setupEventListeners() {
    // Search functionality
    document.getElementById('ticketSearch').addEventListener('input', filterTickets);
    document.getElementById('statusFilter').addEventListener('change', filterTickets);
    document.getElementById('branchFilter').addEventListener('change', filterTickets);
}

async function loadTickets() {
    try {
        const response = await fetch('/search?q=&limit=1000');
        if (response.ok) {
            const data = await response.json();
            allTickets = data.tickets || [];
            filteredTickets = [...allTickets];
            updateStats();
            renderTickets();
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        showError('Failed to load tickets');
    }
}

async function loadBranches() {
    try {
        const response = await fetch('/branches');
        if (response.ok) {
            const data = await response.json();
            const branchFilter = document.getElementById('branchFilter');

            data.branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = branch.name;
                branchFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading branches:', error);
    }
}

function filterTickets() {
    const searchTerm = document.getElementById('ticketSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const branchFilter = document.getElementById('branchFilter').value;

    filteredTickets = allTickets.filter(ticket => {
        const matchesSearch = ticket.question.toLowerCase().includes(searchTerm) ||
                            ticket.solution.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || getTicketStatus(ticket) === statusFilter;
        const matchesBranch = !branchFilter || ticket.branch?.id == branchFilter;

        return matchesSearch && matchesStatus && matchesBranch;
    });

    renderTickets();
}

function getTicketStatus(ticket) {
    // Simple status determination based on solution content
    if (ticket.solution.toLowerCase().includes('no solution provided')) {
        return 'open';
    } else if (ticket.solution.toLowerCase().includes('in progress')) {
        return 'in-progress';
    } else {
        return 'resolved';
    }
}

function updateStats() {
    const total = allTickets.length;
    const open = allTickets.filter(t => getTicketStatus(t) === 'open').length;
    const inProgress = allTickets.filter(t => getTicketStatus(t) === 'in-progress').length;
    const resolved = allTickets.filter(t => getTicketStatus(t) === 'resolved').length;

    document.getElementById('totalTickets').textContent = total;
    document.getElementById('openTickets').textContent = open;
    document.getElementById('inProgressTickets').textContent = inProgress;
    document.getElementById('resolvedTickets').textContent = resolved;
}

function renderTickets() {
    const container = document.getElementById('ticketsList');
    container.innerHTML = '';

    if (filteredTickets.length === 0) {
        container.innerHTML = '<div class="no-tickets">No tickets found matching your criteria.</div>';
        return;
    }

    filteredTickets.forEach(ticket => {
        const ticketElement = createTicketElement(ticket);
        container.appendChild(ticketElement);
    });
}

function createTicketElement(ticket) {
    const div = document.createElement('div');
    div.className = 'ticket-row';
    div.onclick = () => showTicketDetails(ticket);

    const status = getTicketStatus(ticket);
    const statusClass = `status-${status}`;

    div.innerHTML = `
        <div class="col-id">#${ticket.orderNumber}</div>
        <div class="col-question">${truncateText(ticket.question, 80)}</div>
        <div class="col-branch">${ticket.branch?.name || 'N/A'}</div>
        <div class="col-status">
            <span class="status-badge ${statusClass}">${status.replace('-', ' ').toUpperCase()}</span>
        </div>
        <div class="col-actions">
            <button onclick="event.stopPropagation(); editTicket(${ticket.orderNumber})" class="action-btn">✏️</button>
            <button onclick="event.stopPropagation(); deleteTicket(${ticket.orderNumber})" class="action-btn delete">🗑️</button>
        </div>
    `;

    return div;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showTicketDetails(ticket) {
    const modal = document.getElementById('ticketModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `Ticket #${ticket.orderNumber}`;
    modalBody.innerHTML = `
        <div class="ticket-details">
            <div class="detail-section">
                <h4>Question</h4>
                <p>${ticket.question}</p>
            </div>
            <div class="detail-section">
                <h4>Solution</h4>
                <p>${ticket.solution}</p>
            </div>
            <div class="detail-section">
                <h4>Branch</h4>
                <p>${ticket.branch?.name || 'N/A'}</p>
            </div>
            <div class="detail-section">
                <h4>Category</h4>
                <p>${ticket.branch?.category || 'N/A'}</p>
            </div>
            <div class="detail-section">
                <h4>Contact</h4>
                <p>${ticket.branch?.contact || 'N/A'}</p>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('ticketModal').style.display = 'none';
}

function editTicket(ticketId) {
    // Navigate to edit page (placeholder for now)
    alert(`Edit functionality for ticket #${ticketId} coming soon!`);
}

function deleteTicket(ticketId) {
    if (confirm(`Are you sure you want to delete ticket #${ticketId}?`)) {
        alert(`Delete functionality for ticket #${ticketId} coming soon!`);
    }
}

function refreshTickets() {
    loadTickets();
}

function exportTickets() {
    // Simple CSV export
    const csvContent = [
        ['ID', 'Question', 'Solution', 'Branch', 'Status'],
        ...filteredTickets.map(ticket => [
            ticket.orderNumber,
            `"${ticket.question}"`,
            `"${ticket.solution}"`,
            ticket.branch?.name || 'N/A',
            getTicketStatus(ticket)
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function showError(message) {
    // Simple error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: red; padding: 10px; margin: 10px 0; border: 1px solid red; border-radius: 4px;';

    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild.nextSibling);

    setTimeout(() => errorDiv.remove(), 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('ticketModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
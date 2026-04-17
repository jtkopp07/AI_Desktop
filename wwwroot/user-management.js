// User Management JavaScript

let allUsers = [];
let filteredUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    loadBranches();
    setupEventListeners();
});

function setupEventListeners() {
    // Search and filters
    document.getElementById('userSearch').addEventListener('input', filterUsers);
    document.getElementById('roleFilter').addEventListener('change', filterUsers);
    document.getElementById('statusFilter').addEventListener('change', filterUsers);

    // Form submission
    document.getElementById('userForm').addEventListener('submit', saveUser);
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            const data = await response.json();
            allUsers = data.users || [];
            filteredUsers = [...allUsers];
            updateStats();
            renderUsers();
        } else {
            // For demo purposes, create sample users
            createSampleUsers();
        }
    } catch (error) {
        console.error('Error loading users:', error);
        createSampleUsers();
    }
}

function createSampleUsers() {
    allUsers = [
        {
            id: 1,
            username: 'admin',
            email: 'admin@company.com',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'Admin',
            isActive: true,
            createdAt: '2024-01-15T00:00:00Z',
            lastLoginAt: '2024-12-16T10:30:00Z',
            branchName: 'IT Support Branch'
        },
        {
            id: 2,
            username: 'jdoe',
            email: 'john.doe@company.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'Manager',
            isActive: true,
            createdAt: '2024-02-20T00:00:00Z',
            lastLoginAt: '2024-12-15T14:22:00Z',
            branchName: 'Sales Branch'
        },
        {
            id: 3,
            username: 'asmith',
            email: 'alice.smith@company.com',
            firstName: 'Alice',
            lastName: 'Smith',
            role: 'User',
            isActive: true,
            createdAt: '2024-03-10T00:00:00Z',
            lastLoginAt: '2024-12-14T09:15:00Z',
            branchName: 'Marketing Branch'
        },
        {
            id: 4,
            username: 'bwilson',
            email: 'bob.wilson@company.com',
            firstName: 'Bob',
            lastName: 'Wilson',
            role: 'User',
            isActive: false,
            createdAt: '2024-04-05T00:00:00Z',
            lastLoginAt: '2024-11-20T16:45:00Z',
            branchName: 'HR Branch'
        }
    ];
    filteredUsers = [...allUsers];
    updateStats();
    renderUsers();
}

async function loadBranches() {
    try {
        const response = await fetch('/branches');
        if (response.ok) {
            const data = await response.json();
            const branchSelect = document.getElementById('branchId');

            data.branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = branch.name;
                branchSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading branches:', error);
    }
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredUsers = allUsers.filter(user => {
        const matchesSearch = !searchTerm ||
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);

        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.isActive.toString() === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    renderUsers();
}

function updateStats() {
    const total = allUsers.length;
    const active = allUsers.filter(u => u.isActive).length;
    const admins = allUsers.filter(u => u.role === 'Admin').length;
    const newThisMonth = allUsers.filter(u => {
        const created = new Date(u.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    document.getElementById('totalUsers').textContent = total;
    document.getElementById('activeUsers').textContent = active;
    document.getElementById('adminUsers').textContent = admins;
    document.getElementById('newUsers').textContent = newThisMonth;
}

function renderUsers() {
    const container = document.getElementById('usersList');
    container.innerHTML = '';

    if (filteredUsers.length === 0) {
        container.innerHTML = '<div class="no-users">No users found matching your criteria.</div>';
        return;
    }

    filteredUsers.forEach(user => {
        const userElement = createUserElement(user);
        container.appendChild(userElement);
    });
}

function createUserElement(user) {
    const div = document.createElement('div');
    div.className = 'user-row';

    const fullName = `${user.firstName} ${user.lastName}`;
    const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never';
    const statusClass = user.isActive ? 'status-active' : 'status-inactive';
    const statusText = user.isActive ? 'Active' : 'Inactive';

    div.innerHTML = `
        <div class="col-name">
            <div class="user-avatar">${user.firstName[0]}${user.lastName[0]}</div>
            <div class="user-info">
                <div class="user-fullname">${fullName}</div>
                <div class="user-username">@${user.username}</div>
            </div>
        </div>
        <div class="col-email">${user.email}</div>
        <div class="col-role">
            <span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span>
        </div>
        <div class="col-branch">${user.branchName || 'N/A'}</div>
        <div class="col-status">
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="col-lastlogin">${lastLogin}</div>
        <div class="col-actions">
            <button onclick="editUser(${user.id})" class="action-btn">✏️</button>
            <button onclick="toggleUserStatus(${user.id})" class="action-btn">
                ${user.isActive ? '🚫' : '✅'}
            </button>
            <button onclick="deleteUser(${user.id})" class="action-btn delete">🗑️</button>
        </div>
    `;

    return div;
}

function showAddUserModal() {
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userModal').style.display = 'block';
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('firstName').value = user.firstName;
    document.getElementById('lastName').value = user.lastName;
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('role').value = user.role;
    // Note: In a real app, you'd need to set the branch ID

    document.getElementById('userModal').style.display = 'block';
}

async function saveUser(e) {
    e.preventDefault();

    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        branchId: parseInt(document.getElementById('branchId').value) || null
    };

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            showNotification('User saved successfully!', 'success');
            closeModal();
            loadUsers();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to save user', 'error');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showNotification('Failed to save user', 'error');
    }
}

function toggleUserStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const action = user.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
        user.isActive = !user.isActive;
        updateStats();
        renderUsers();
        showNotification(`User ${action}d successfully!`, 'success');
    }
}

function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
        allUsers = allUsers.filter(u => u.id !== userId);
        filteredUsers = filteredUsers.filter(u => u.id !== userId);
        updateStats();
        renderUsers();
        showNotification('User deleted successfully!', 'success');
    }
}

function refreshUsers() {
    loadUsers();
}

function exportUsers() {
    const csvContent = [
        ['Name', 'Username', 'Email', 'Role', 'Branch', 'Status', 'Last Login'],
        ...filteredUsers.map(user => [
            `${user.firstName} ${user.lastName}`,
            user.username,
            user.email,
            user.role,
            user.branchName || 'N/A',
            user.isActive ? 'Active' : 'Inactive',
            user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Users exported successfully!', 'success');
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
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

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
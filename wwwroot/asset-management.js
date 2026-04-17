// Asset Management JavaScript

let allAssets = [];
let filteredAssets = [];

document.addEventListener('DOMContentLoaded', function() {
    loadAssets();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('assetSearch').addEventListener('input', filterAssets);
    document.getElementById('statusFilter').addEventListener('change', filterAssets);
    document.getElementById('assetForm').addEventListener('submit', saveAsset);
}

async function loadAssets() {
    try {
        const response = await fetch('/api/assets');
        if (response.ok) {
            const data = await response.json();
            allAssets = data.assets || [];
            filteredAssets = [...allAssets];
            updateStats();
            renderAssets();
        } else {
            createSampleAssets();
        }
    } catch (error) {
        console.error('Error loading assets:', error);
        createSampleAssets();
    }
}

function createSampleAssets() {
    allAssets = [
        {
            id: 1,
            name: 'Dell Latitude 7420',
            type: 'Laptop',
            location: 'HQ - 4th Floor',
            status: 'Active',
            assignedTo: 'jdoe',
            createdAt: '2024-01-10T00:00:00Z'
        },
        {
            id: 2,
            name: 'Cisco Catalyst 9300',
            type: 'Network Switch',
            location: 'Data Center 1',
            status: 'In Repair',
            assignedTo: 'NOC Team',
            createdAt: '2024-05-18T00:00:00Z'
        },
        {
            id: 3,
            name: 'MacBook Pro 16"',
            type: 'Laptop',
            location: 'Design Studio',
            status: 'Active',
            assignedTo: 'asmith',
            createdAt: '2024-07-02T00:00:00Z'
        }
    ];
    filteredAssets = [...allAssets];
    updateStats();
    renderAssets();
}

function filterAssets() {
    const searchTerm = document.getElementById('assetSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    filteredAssets = allAssets.filter(asset => {
        const matchesSearch = !searchTerm ||
            asset.name.toLowerCase().includes(searchTerm) ||
            asset.type.toLowerCase().includes(searchTerm) ||
            asset.location.toLowerCase().includes(searchTerm) ||
            (asset.assignedTo || '').toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter || asset.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    renderAssets();
}

function updateStats() {
    const total = allAssets.length;
    const active = allAssets.filter(a => a.status === 'Active').length;
    const maintenance = allAssets.filter(a => a.status === 'In Repair').length;
    const newThisMonth = allAssets.filter(a => {
        const created = new Date(a.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    document.getElementById('totalAssets').textContent = total;
    document.getElementById('activeAssets').textContent = active;
    document.getElementById('maintenanceAssets').textContent = maintenance;
    document.getElementById('newAssets').textContent = newThisMonth;
}

function renderAssets() {
    const container = document.getElementById('assetsList');
    container.innerHTML = '';

    if (filteredAssets.length === 0) {
        container.innerHTML = '<div class="no-assets">No assets found matching your criteria.</div>';
        return;
    }

    filteredAssets.forEach(asset => {
        const assetElement = createAssetElement(asset);
        container.appendChild(assetElement);
    });
}

function createAssetElement(asset) {
    const div = document.createElement('div');
    div.className = 'asset-row';

    div.innerHTML = `
        <div class="col-name">${asset.name}</div>
        <div class="col-type">${asset.type}</div>
        <div class="col-location">${asset.location}</div>
        <div class="col-status">${asset.status}</div>
        <div class="col-assigned">${asset.assignedTo || 'Unassigned'}</div>
        <div class="col-actions">
            <button onclick="editAsset(${asset.id})" class="action-btn">✏️</button>
            <button onclick="deleteAsset(${asset.id})" class="action-btn delete">🗑️</button>
        </div>
    `;

    return div;
}

function showAddAssetModal() {
    document.getElementById('assetModalTitle').textContent = 'Add New Asset';
    document.getElementById('assetForm').reset();
    document.getElementById('assetModal').style.display = 'block';
}

function editAsset(assetId) {
    const asset = allAssets.find(a => a.id === assetId);
    if (!asset) return;

    document.getElementById('assetModalTitle').textContent = 'Edit Asset';
    document.getElementById('assetName').value = asset.name;
    document.getElementById('assetType').value = asset.type;
    document.getElementById('assetLocation').value = asset.location;
    document.getElementById('assetStatus').value = asset.status;
    document.getElementById('assetModal').style.display = 'block';
}

function saveAsset(e) {
    e.preventDefault();

    const assetData = {
        name: document.getElementById('assetName').value,
        type: document.getElementById('assetType').value,
        location: document.getElementById('assetLocation').value,
        status: document.getElementById('assetStatus').value
    };

    allAssets.push({
        id: Date.now(),
        ...assetData,
        assignedTo: 'Unassigned',
        createdAt: new Date().toISOString()
    });

    filteredAssets = [...allAssets];
    updateStats();
    renderAssets();
    closeAssetModal();
    showNotification('Asset saved successfully!', 'success');
}

function deleteAsset(assetId) {
    if (confirm('Delete this asset?')) {
        allAssets = allAssets.filter(a => a.id !== assetId);
        filteredAssets = filteredAssets.filter(a => a.id !== assetId);
        updateStats();
        renderAssets();
        showNotification('Asset deleted successfully!', 'success');
    }
}

function refreshAssets() {
    loadAssets();
}

function closeAssetModal() {
    document.getElementById('assetModal').style.display = 'none';
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

window.onclick = function(event) {
    const modal = document.getElementById('assetModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
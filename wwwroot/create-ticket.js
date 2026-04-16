const descriptionInput = document.getElementById('descriptionInput');
const branchSelect = document.getElementById('branchSelect');
const solutionInput = document.getElementById('solutionInput');
const createButton = document.getElementById('createButton');
const clearButton = document.getElementById('clearButton');
const statusText = document.getElementById('statusText');
const messageBox = document.getElementById('messageBox');

function setLoading(isLoading) {
    createButton.disabled = isLoading;
    clearButton.disabled = isLoading;
    descriptionInput.disabled = isLoading;
    solutionInput.disabled = isLoading;
    statusText.textContent = isLoading ? 'Creating ticket...' : 'Ready to create ticket.';
}

function showMessage(text, type = 'success') {
    messageBox.innerHTML = `<div class="${type}">${text}</div>`;
}

function clearMessage() {
    messageBox.innerHTML = '';
}

function clearForm() {
    descriptionInput.value = '';
    solutionInput.value = '';
    clearMessage();
    statusText.textContent = 'Ready to create ticket.';
}

async function loadBranches() {
    try {
        const response = await fetch('/branches');
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        branchSelect.innerHTML = '<option value="">Select a branch</option>' +
            data.branches.map(branch =>
                `<option value="${branch.id}">${branch.name}</option>`
            ).join('');
    } catch (error) {
        console.error(error);
        branchSelect.innerHTML = '<option value="">Unable to load branches</option>';
    }
}

async function createTicket() {
    const description = descriptionInput.value.trim();
    const branchId = parseInt(branchSelect.value, 10);
    const solution = solutionInput.value.trim();

    if (!description) {
        showMessage('Please provide a ticket description before creating the ticket.', 'error');
        return;
    }

    if (Number.isNaN(branchId) || branchId <= 0) {
        showMessage('Please select a valid branch for the ticket.', 'error');
        return;
    }

    setLoading(true);
    clearMessage();

    try {
        const response = await fetch('/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description, solution, branchId })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || 'Failed to create the ticket.', 'error');
            return;
        }

        showMessage(`✅ ${data.message}`);
        statusText.textContent = `Ticket #${data.ticketNumber} created.`;
        descriptionInput.value = '';
        solutionInput.value = '';
        branchSelect.value = '';
    } catch (error) {
        console.error(error);
        showMessage('There was an error creating the ticket. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

createButton.addEventListener('click', createTicket);
clearButton.addEventListener('click', clearForm);

descriptionInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.shiftKey) {
        return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        createTicket();
    }
});

window.addEventListener('DOMContentLoaded', loadBranches);

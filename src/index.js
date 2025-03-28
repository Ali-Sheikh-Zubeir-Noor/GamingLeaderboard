// URL
const BASE_URL = 'https://my-json-server.typicode.com/Ali-Sheikh-Zubeir-Noor/GamingLeaderboard';

// Fetching DOM Elements
const playerForm = document.getElementById('playerForm');
const leaderboardBody = document.getElementById('leaderboardBody');
const toastEl = document.getElementById('liveToast');
const toastBody = toastEl.querySelector('.toast-body');
const toast = new bootstrap.Toast(toastEl);

// Event Listeners 
document.addEventListener('DOMContentLoaded', loadPlayers);
playerForm.addEventListener('submit', handleFormSubmit);
leaderboardBody.addEventListener('click', handleTableActions);

// Load all players
async function loadPlayers() {
    try {
        const response = await fetch(`${BASE_URL}/players`);
        if (!response.ok) throw new Error('Failed to load players');
        
        const players = await response.json();
        renderLeaderboard(players);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('playerName').value.trim();
    const score = parseInt(document.getElementById('playerScore').value);
    
    if (!name || isNaN(score)) {
        showToast('Please enter valid name and score', 'error');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score })
        });
        
        if (!response.ok) throw new Error('Failed to add player');
        
        showToast('Player added successfully', 'success');
        loadPlayers(); // Refresh the list
        playerForm.reset();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Handle table actions (delete or update)
async function handleTableActions(e) {
    const row = e.target.closest('tr');
    if (!row) return;
    
    const playerId = row.dataset.id;
    
    // Delete button clicked
    if (e.target.classList.contains('delete-btn')) {
        if (!confirm('Are you sure you want to delete this player?')) return;
        
        try {
            const response = await fetch(`${BASE_URL}/${playerId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete player');
            
            showToast('Player deleted', 'success');
            loadPlayers(); // Refresh the list
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
    
    // Update button clicked
    if (e.target.classList.contains('update-btn')) {
        const newScore = prompt('Enter new score:');
        if (!newScore || isNaN(newScore)) return;
        
        try {
            const response = await fetch(`${BASE_URL}/${playerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: parseInt(newScore) })
            });
            
            if (!response.ok) throw new Error('Failed to update player');
            
            showToast('Player updated', 'success');
            loadPlayers(); // Refresh the list
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

// Render the leaderboard
function renderLeaderboard(players) {
    leaderboardBody.innerHTML = '';
    
    // Sort by score descending
    players.sort((a, b) => b.score - a.score);
    
    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.dataset.id = player.id;
        
        // Highlight top 3 players
        if (index === 0) row.classList.add('gold', 'top-player');
        else if (index === 1) row.classList.add('silver');
        else if (index === 2) row.classList.add('bronze');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td class="text-end fw-bold">${player.score}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary update-btn me-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    toastBody.textContent = message;
    const toastHeader = toastEl.querySelector('.toast-header');
    
    // Reset classes
    toastHeader.className = 'toast-header';
    toastBody.className = 'toast-body';
    
    // Add type-specific classes
    if (type === 'error') {
        toastHeader.classList.add('text-bg-danger');
    } else {
        toastHeader.classList.add('text-bg-success');
    }
    
    toast.show();
}
// Data Management
class SundayChallengeTracker {
    constructor() {
        this.players = this.loadPlayers();
        this.adminPassword = this.loadAdminPassword();
        this.isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        this.recentUpdates = this.loadRecentUpdates();
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.checkAdminStatus();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        const adminBtn = document.getElementById('adminBtn');
        const homeBtn = document.getElementById('homeBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                window.location.href = 'admin.html';
            });
        }

        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Admin Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Add Player Form
        const addPlayerForm = document.getElementById('addPlayerForm');
        if (addPlayerForm) {
            addPlayerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddPlayer();
            });
        }

        // Settings Form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordChange();
            });
        }

        // Quick Actions
        const resetAllBtn = document.getElementById('resetAllBtn');
        const clearDataBtn = document.getElementById('clearDataBtn');
        const exportDataBtn = document.getElementById('exportDataBtn');

        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', () => {
                this.resetAllScores();
            });
        }

        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
    }

    // Data Persistence
    loadPlayers() {
        const stored = localStorage.getItem('sundayChallengePlayers');
        return stored ? JSON.parse(stored) : [];
    }

    savePlayers() {
        localStorage.setItem('sundayChallengePlayers', JSON.stringify(this.players));
    }

    loadAdminPassword() {
        const stored = localStorage.getItem('sundayChallengeAdminPassword');
        return stored || 'admin123'; // Default password
    }

    saveAdminPassword(password) {
        localStorage.setItem('sundayChallengeAdminPassword', password);
        this.adminPassword = password;
    }

    loadRecentUpdates() {
        const stored = localStorage.getItem('sundayChallengeRecentUpdates');
        return stored ? JSON.parse(stored) : [];
    }

    saveRecentUpdates() {
        // Keep only the last 10 updates
        if (this.recentUpdates.length > 10) {
            this.recentUpdates = this.recentUpdates.slice(-10);
        }
        localStorage.setItem('sundayChallengeRecentUpdates', JSON.stringify(this.recentUpdates));
    }

    addRecentUpdate(text) {
        const update = {
            text: text,
            timestamp: new Date().toLocaleString()
        };
        this.recentUpdates.push(update);
        this.saveRecentUpdates();
    }

    // Authentication
    handleLogin() {
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        if (password === this.adminPassword) {
            this.isAdminLoggedIn = true;
            sessionStorage.setItem('adminLoggedIn', 'true');
            this.showAdminPanel();
            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = 'Incorrect password. Please try again.';
            errorDiv.style.display = 'block';
            document.getElementById('password').value = '';
        }
    }

    logout() {
        this.isAdminLoggedIn = false;
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    }

    checkAdminStatus() {
        if (window.location.pathname.includes('admin.html')) {
            if (this.isAdminLoggedIn) {
                this.showAdminPanel();
            } else {
                this.showLoginForm();
            }
        }
    }

    showLoginForm() {
        const loginSection = document.getElementById('loginSection');
        const adminPanel = document.getElementById('adminPanel');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginSection) loginSection.style.display = 'block';
        if (adminPanel) adminPanel.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    showAdminPanel() {
        const loginSection = document.getElementById('loginSection');
        const adminPanel = document.getElementById('adminPanel');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginSection) loginSection.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';

        this.updateAdminDisplay();
    }

    // Player Management
    handleAddPlayer() {
        const playerName = document.getElementById('playerName').value.trim();
        const initialPoints = parseInt(document.getElementById('initialPoints').value) || 0;

        if (!playerName) {
            alert('Please enter a player name.');
            return;
        }

        // Check if player already exists
        if (this.players.find(p => p.name.toLowerCase() === playerName.toLowerCase())) {
            alert('A player with this name already exists.');
            return;
        }

        const newPlayer = {
            id: Date.now().toString(),
            name: playerName,
            points: initialPoints,
            gamesPlayed: 0,
            created: new Date().toISOString()
        };

        this.players.push(newPlayer);
        this.savePlayers();
        this.addRecentUpdate(`Added new player: ${playerName} with ${initialPoints} points`);

        // Clear form
        document.getElementById('playerName').value = '';
        document.getElementById('initialPoints').value = '0';

        this.updateAdminDisplay();
        this.showSuccessMessage('Player added successfully!');
    }

    updatePlayerPoints(playerId, pointsChange) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        const oldPoints = player.points;
        player.points = Math.max(0, player.points + pointsChange);
        player.gamesPlayed++;

        this.savePlayers();
        this.addRecentUpdate(`${player.name}: ${oldPoints} → ${player.points} points (${pointsChange > 0 ? '+' : ''}${pointsChange})`);
        this.updateAdminDisplay();
    }

    deletePlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        if (confirm(`Are you sure you want to delete ${player.name}? This action cannot be undone.`)) {
            this.players = this.players.filter(p => p.id !== playerId);
            this.savePlayers();
            this.addRecentUpdate(`Deleted player: ${player.name}`);
            this.updateAdminDisplay();
        }
    }

    // Password Management
    handlePasswordChange() {
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (!newPassword) {
            alert('Please enter a new password.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        this.saveAdminPassword(newPassword);
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        this.showSuccessMessage('Password updated successfully!');
    }

    // Quick Actions
    resetAllScores() {
        if (confirm('Are you sure you want to reset all player scores to 0? This cannot be undone.')) {
            this.players.forEach(player => {
                player.points = 0;
                player.gamesPlayed = 0;
            });
            this.savePlayers();
            this.addRecentUpdate('All player scores have been reset to 0');
            this.updateAdminDisplay();
            this.showSuccessMessage('All scores have been reset!');
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to delete ALL data including players, scores, and history? This cannot be undone!')) {
            if (confirm('This will permanently delete everything. Are you absolutely sure?')) {
                this.players = [];
                this.recentUpdates = [];
                this.savePlayers();
                this.saveRecentUpdates();
                this.addRecentUpdate('All data has been cleared');
                this.updateAdminDisplay();
                this.showSuccessMessage('All data has been cleared!');
            }
        }
    }

    exportData() {
        const data = {
            players: this.players,
            recentUpdates: this.recentUpdates,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `sunday-challenge-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showSuccessMessage('Data exported successfully!');
    }

    // Display Updates
    updateDisplay() {
        this.updateLeaderboard();
        this.updateStats();
        this.updateRecentUpdates();
    }

    updateLeaderboard() {
        const playersList = document.getElementById('playersList');
        if (!playersList) return;

        if (this.players.length === 0) {
            playersList.innerHTML = `
                <div class="no-players">
                    <p>No players added yet!</p>
                    <p>Use Admin Mode to add players and start tracking scores.</p>
                </div>
            `;
            return;
        }

        // Sort players by points (descending)
        const sortedPlayers = [...this.players].sort((a, b) => b.points - a.points);

        playersList.innerHTML = sortedPlayers.map((player, index) => {
            const rank = index + 1;
            let rankClass = '';
            let rankIcon = '';

            if (rank === 1) {
                rankClass = 'rank-1';
                rankIcon = '🥇';
            } else if (rank === 2) {
                rankClass = 'rank-2';
                rankIcon = '🥈';
            } else if (rank === 3) {
                rankClass = 'rank-3';
                rankIcon = '🥉';
            }

            return `
                <div class="player-item ${rankClass}">
                    <div class="player-rank">${rankIcon || rank}</div>
                    <div class="player-info">
                        <div class="player-name">${player.name}</div>
                        <div class="player-games">Games played: ${player.gamesPlayed}</div>
                    </div>
                    <div class="player-points">${player.points}</div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const totalPlayersEl = document.getElementById('totalPlayers');
        const totalGamesEl = document.getElementById('totalGames');
        const currentLeaderEl = document.getElementById('currentLeader');

        if (totalPlayersEl) {
            totalPlayersEl.textContent = this.players.length;
        }

        if (totalGamesEl) {
            const totalGames = this.players.reduce((sum, player) => sum + player.gamesPlayed, 0);
            totalGamesEl.textContent = totalGames;
        }

        if (currentLeaderEl) {
            if (this.players.length === 0) {
                currentLeaderEl.textContent = '-';
            } else {
                const leader = [...this.players].sort((a, b) => b.points - a.points)[0];
                currentLeaderEl.textContent = leader.name;
            }
        }
    }

    updateRecentUpdates() {
        const recentUpdatesEl = document.getElementById('recentUpdates');
        if (!recentUpdatesEl) return;

        if (this.recentUpdates.length === 0) {
            recentUpdatesEl.innerHTML = '<p class="no-updates">No recent score updates</p>';
            return;
        }

        const recentUpdatesSorted = [...this.recentUpdates].reverse();
        recentUpdatesEl.innerHTML = recentUpdatesSorted.map(update => `
            <div class="update-item">
                <div class="update-time">${update.timestamp}</div>
                <div class="update-text">${update.text}</div>
            </div>
        `).join('');
    }

    updateAdminDisplay() {
        const adminPlayersList = document.getElementById('adminPlayersList');
        if (!adminPlayersList) return;

        if (this.players.length === 0) {
            adminPlayersList.innerHTML = `
                <div class="no-players">
                    <p>No players added yet. Add your first player above!</p>
                </div>
            `;
            return;
        }

        // Sort players by points (descending) for admin view
        const sortedPlayers = [...this.players].sort((a, b) => b.points - a.points);

        adminPlayersList.innerHTML = sortedPlayers.map(player => `
            <div class="admin-player-item">
                <div class="admin-player-info">
                    <div class="admin-player-name">${player.name}</div>
                    <div class="admin-player-points">Current points: ${player.points} | Games: ${player.gamesPlayed}</div>
                </div>
                <div class="admin-player-controls">
                    <input type="number" class="point-input" id="points-${player.id}" placeholder="Points" min="1" max="100" value="1">
                    <input type="number" class="game_input" id="gamesPlayed-${player.id}" placeholder="Games" min="1" max="100" value="1">

                    <button class="control-btn add-points" onclick="tracker.updatePlayerPoints('${player.id}', parseInt(document.getElementById('points-${player.id}').value) || 1)">
                        + Add
                    </button>
                    <button class="control-btn subtract-points" onclick="tracker.updatePlayerPoints('${player.id}', -(parseInt(document.getElementById('points-${player.id}').value) || 1))">
                        - Subtract
                    </button>
                    <button class="control-btn delete-player" onclick="tracker.deletePlayer('${player.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Utility Methods
    showSuccessMessage(message) {
        // Create or update success message element
        let successDiv = document.querySelector('.success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            
            // Insert after the first form in admin panel
            const firstForm = document.querySelector('#adminPanel form');
            if (firstForm) {
                firstForm.parentNode.insertBefore(successDiv, firstForm.nextSibling);
            }
        }

        successDiv.textContent = message;
        successDiv.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

// Initialize the application when the page loads
let tracker;

document.addEventListener('DOMContentLoaded', () => {
    tracker = new SundayChallengeTracker();
});

// Refresh display every 30 seconds when on the main page
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    setInterval(() => {
        if (tracker) {
            tracker.updateDisplay();
        }
    }, 30000);
}

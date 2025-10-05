// Data Management
class SundayChallengeTracker {
    constructor() {
        this.players = [];
        this.adminPassword = 'admin123';
        this.isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        this.recentUpdates = [];
        this.dataLoaded = false;
        this.init();
    }

    // Initialize the application
    async init() {
        // Load data from Firebase first
        await this.loadAllData();
        
        this.setupEventListeners();
        this.updateDisplay();
        this.checkAdminStatus();
    }

    // Load all data from Firebase
    async loadAllData() {
        try {
            console.log('Loading data from Firebase...');
            
            // Load all data in parallel
            const [players, adminPassword, recentUpdates] = await Promise.all([
                this.loadPlayers(),
                this.loadAdminPassword(),
                this.loadRecentUpdates()
            ]);
            
            this.players = players;
            this.adminPassword = adminPassword;
            this.recentUpdates = recentUpdates;
            this.dataLoaded = true;
            
            console.log('All data loaded successfully from Firebase');
        } catch (error) {
            console.error('Error loading data:', error);
            // Set defaults if loading fails
            this.players = [];
            this.adminPassword = 'admin123';
            this.recentUpdates = [];
            this.dataLoaded = true;
        }
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
    async loadPlayers() {
        try {
            const data = await window.firebaseManager.loadData('tournament', 'players');
            return data ? data.players || [] : [];
        } catch (error) {
            console.error('Error loading players from Firebase:', error);
            // Fallback to localStorage if Firebase fails
            const stored = localStorage.getItem('sundayChallengePlayers');
            return stored ? JSON.parse(stored) : [];
        }
    }

    async savePlayers() {
        try {
            const success = await window.firebaseManager.saveData('tournament', 'players', {
                players: this.players,
                lastUpdated: new Date().toISOString()
            });
            
            if (success) {
                console.log('Players saved to Firebase successfully');
            } else {
                throw new Error('Failed to save to Firebase');
            }
        } catch (error) {
            console.error('Error saving players to Firebase:', error);
            // Fallback to localStorage if Firebase fails
            localStorage.setItem('sundayChallengePlayers', JSON.stringify(this.players));
        }
    }

    async loadAdminPassword() {
        try {
            const data = await window.firebaseManager.loadData('tournament', 'settings');
            return data ? data.adminPassword || 'admin123' : 'admin123';
        } catch (error) {
            console.error('Error loading admin password from Firebase:', error);
            // Fallback to localStorage if Firebase fails
            const stored = localStorage.getItem('sundayChallengeAdminPassword');
            return stored || 'admin123';
        }
    }

    async saveAdminPassword(password) {
        try {
            const success = await window.firebaseManager.saveData('tournament', 'settings', {
                adminPassword: password,
                lastUpdated: new Date().toISOString()
            });
            
            if (success) {
                this.adminPassword = password;
                console.log('Admin password saved to Firebase successfully');
            } else {
                throw new Error('Failed to save password to Firebase');
            }
        } catch (error) {
            console.error('Error saving admin password to Firebase:', error);
            // Fallback to localStorage if Firebase fails
            localStorage.setItem('sundayChallengeAdminPassword', password);
            this.adminPassword = password;
        }
    }

    async loadRecentUpdates() {
        try {
            const data = await window.firebaseManager.loadData('tournament', 'updates');
            return data ? data.updates || [] : [];
        } catch (error) {
            console.error('Error loading recent updates from Firebase:', error);
            // Fallback to localStorage if Firebase fails
            const stored = localStorage.getItem('sundayChallengeRecentUpdates');
            return stored ? JSON.parse(stored) : [];
        }
    }

    async saveRecentUpdates() {
        // Keep only the last 10 updates
        if (this.recentUpdates.length > 10) {
            this.recentUpdates = this.recentUpdates.slice(-10);
        }
        
        try {
            const success = await window.firebaseManager.saveData('tournament', 'updates', {
                updates: this.recentUpdates,
                lastUpdated: new Date().toISOString()
            });
            
            if (success) {
                console.log('Recent updates saved to Firebase successfully');
            } else {
                throw new Error('Failed to save updates to Firebase');
            }
        } catch (error) {
            console.error('Error saving recent updates to Firebase:', error);
            // Fallback to localStorage if Firebase fails
            localStorage.setItem('sundayChallengeRecentUpdates', JSON.stringify(this.recentUpdates));
        }
    }

    async addRecentUpdate(text) {
        const update = {
            text: text,
            timestamp: new Date().toLocaleString()
        };
        this.recentUpdates.push(update);
        await this.saveRecentUpdates();
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
    async handleAddPlayer() {
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
        await this.savePlayers();
        await this.addRecentUpdate(`Added new player: ${playerName} with ${initialPoints} points`);

        // Clear form
        document.getElementById('playerName').value = '';
        document.getElementById('initialPoints').value = '0';

        this.updateAdminDisplay();
        this.showSuccessMessage('Player added successfully!');
    }

    async updatePlayerPoints(playerId, pointsChange) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        const oldPoints = player.points;
        player.points = Math.max(0, player.points + pointsChange);
        player.gamesPlayed++;

        await this.savePlayers();
        await this.addRecentUpdate(`${player.name}: ${oldPoints} → ${player.points} points (${pointsChange > 0 ? '+' : ''}${pointsChange})`);
        this.updateAdminDisplay();
    }

    async deletePlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        if (confirm(`Are you sure you want to delete ${player.name}? This action cannot be undone.`)) {
            this.players = this.players.filter(p => p.id !== playerId);
            await this.savePlayers();
            await this.addRecentUpdate(`Deleted player: ${player.name}`);
            this.updateAdminDisplay();
        }
    }

    // Password Management
    async handlePasswordChange() {
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

        await this.saveAdminPassword(newPassword);
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        this.showSuccessMessage('Password updated successfully!');
    }

    // Quick Actions
    async resetAllScores() {
        if (confirm('Are you sure you want to reset all player scores to 0? This cannot be undone.')) {
            this.players.forEach(player => {
                player.points = 0;
                player.gamesPlayed = 0;
            });
            await this.savePlayers();
            await this.addRecentUpdate('All player scores have been reset to 0');
            this.updateAdminDisplay();
            this.showSuccessMessage('All scores have been reset!');
        }
    }

    async clearAllData() {
        if (confirm('Are you sure you want to delete ALL data including players, scores, and history? This cannot be undone!')) {
            if (confirm('This will permanently delete everything. Are you absolutely sure?')) {
                this.players = [];
                this.recentUpdates = [];
                await this.savePlayers();
                await this.saveRecentUpdates();
                await this.addRecentUpdate('All data has been cleared');
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

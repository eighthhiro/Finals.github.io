// Game progress data
const gameData = {
    currentLevel: 1,
    unlockedLevels: 1,
    totalStars: 1,
    levelStars: [1, 0, 0, 0, 0],
    stats: {
        arrowsFired: 0,
        enemiesDefeated: 0,
        gamesPlayed: 0
    },
    saveData() {
        localStorage.setItem('sovaArcheryData', JSON.stringify({
            unlockedLevels: this.unlockedLevels,
            levelStars: this.levelStars,
            stats: this.stats
        }));
    },
    loadData() {
        const saved = localStorage.getItem('sovaArcheryData');
        if (saved) {
            const data = JSON.parse(saved);
            this.unlockedLevels = data.unlockedLevels;
            this.levelStars = data.levelStars;
            this.stats = data.stats;
            this.updateTotalStars();
        }
    },
    updateTotalStars() {
        this.totalStars = this.levelStars.reduce((sum, stars) => sum + stars, 0);
    },
    completeLevel(level, stars) {
        // Update stars if better than previous
        if (stars > this.levelStars[level - 1]) {
            this.levelStars[level - 1] = stars;
            this.updateTotalStars();
        }
        
        // Unlock next level if not already unlocked
        if (level === this.unlockedLevels && level < 5) {
            this.unlockedLevels++;
        }
        
        this.saveData();
        updateLevelUI();
    }
};

// DOM Elements
const playButton = document.getElementById('playButton');
const levelSelect = document.getElementById('levelSelect');
const backToMain = document.getElementById('backToMain');
const statsButton = document.getElementById('statsButton');
const helpButton = document.getElementById('helpButton');
const statsPanel = document.getElementById('statsPanel');
const helpPanel = document.getElementById('helpPanel');
const lobby = document.getElementById('lobby');
const gameContainer = document.getElementById('gameContainer');
const returnToLobby = document.getElementById('returnToLobby');
const closePanelButtons = document.querySelectorAll('.close-panel');
const levelButtons = document.querySelectorAll('.play-level-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    gameData.loadData();
    updateLevelUI();
    updateStatsUI();
});

// Update UI based on game data
function updateLevelUI() {
    const levels = document.querySelectorAll('.level');
    
    levels.forEach((level, index) => {
        const levelNum = index + 1;
        const stars = gameData.levelStars[index];
        const starElements = level.querySelectorAll('.star');
        const playButton = level.querySelector('.play-level-btn');
        
        // Update stars
        starElements.forEach((star, starIndex) => {
            if (starIndex < stars) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
        
        // Lock/unlock levels
        if (levelNum > gameData.unlockedLevels) {
            level.style.opacity = '0.5';
            playButton.disabled = true;
            playButton.textContent = 'LOCKED';
        } else {
            level.style.opacity = '1';
            playButton.disabled = false;
            playButton.textContent = 'PLAY';
        }
    });
}

function updateStatsUI() {
    document.getElementById('arrowsFired').textContent = gameData.stats.arrowsFired;
    document.getElementById('enemiesDefeated').textContent = gameData.stats.enemiesDefeated;
    
    const accuracy = gameData.stats.arrowsFired > 0 
        ? Math.round((gameData.stats.enemiesDefeated / gameData.stats.arrowsFired) * 100) 
        : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    
    document.getElementById('highestLevel').textContent = gameData.unlockedLevels;
    document.getElementById('totalStars').textContent = gameData.totalStars;
}

// Event Listeners
playButton.addEventListener('click', () => {
    levelSelect.classList.remove('hidden');
});

backToMain.addEventListener('click', () => {
    levelSelect.classList.add('hidden');
});

statsButton.addEventListener('click', () => {
    updateStatsUI();
    statsPanel.classList.remove('hidden');
});

helpButton.addEventListener('click', () => {
    helpPanel.classList.remove('hidden');
});

closePanelButtons.forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.add('hidden');
        });
    });
});

levelButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        if (index + 1 <= gameData.unlockedLevels) {
            startGame(index + 1);
        }
    });
});

returnToLobby.addEventListener('click', () => {
    endGame();
});

// Game control functions
function startGame(level) {
    gameData.currentLevel = level;
    document.getElementById('currentLevel').textContent = level;
    
    // Hide lobby, show game
    lobby.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    // Initialize the game with level data
    if (window.initGame) {
        window.initGame(level);
    }
}

function endGame() {
    // Hide game, show lobby
    gameContainer.classList.add('hidden');
    lobby.classList.remove('hidden');
    levelSelect.classList.add('hidden');
    
    // Stop the game
    if (window.stopGame) {
        window.stopGame();
    }
}

// Interface for game.js to report back level completion
window.reportLevelComplete = function(level, stars) {
    gameData.completeLevel(level, stars);
    
    // Show level complete message
    setTimeout(() => {
        const message = `Level ${level} Complete! Stars earned: ${stars}`;
        alert(message);
        endGame();
    }, 1000);
};

// Update stats from game
window.updateGameStats = function(arrowsFired, enemiesDefeated) {
    gameData.stats.arrowsFired += arrowsFired;
    gameData.stats.enemiesDefeated += enemiesDefeated;
    gameData.stats.gamesPlayed++;
    gameData.saveData();
};
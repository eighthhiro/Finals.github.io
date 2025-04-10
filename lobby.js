const gameData = {
    currentRank: 1,
    unlockedRanks: 1,
    totalPoints: 0,
    // Extended to include Level 6 in Iron rank and adjusted point values
    rankPoints: [0, 0, 0, 0, 0, 0, 0], 
    // Updated for the 6 Iron levels + 1 Bronze level
    rankNames: ["LEVEL 1", "LEVEL 2", "LEVEL 3", "LEVEL 4", "LEVEL 5", "LEVEL 6", "LEVEL 1"],
    // Point requirements for each level
    rankPointRequirements: [20, 20, 20, 20, 10, 10, 20],
    stats: {
        arrowsFired: 0,
        enemiesDefeated: 0,
        gamesPlayed: 0
    },
    saveData() {
        localStorage.setItem('sovaArcheryData', JSON.stringify({
            unlockedRanks: this.unlockedRanks,
            rankPoints: this.rankPoints,
            totalPoints: this.totalPoints,
            stats: this.stats
        }));
    },
    loadData() {
        const saved = localStorage.getItem('sovaArcheryData');
        if (saved) {
            const data = JSON.parse(saved);
            this.unlockedRanks = data.unlockedRanks || 1;
            this.rankPoints = data.rankPoints || [0, 0, 0, 0, 0, 0, 0];
            this.totalPoints = data.totalPoints || 0;
            this.stats = data.stats || {
                arrowsFired: 0,
                enemiesDefeated: 0,
                gamesPlayed: 0
            };
        }
    },
    addPoints(level, points) {
        // Now each level has its own point requirement from the array
        const pointRequirement = this.rankPointRequirements[level - 1];
        // Using level-appropriate point rewards
        const pointsToAdd = pointRequirement;
        
        this.rankPoints[level - 1] += pointsToAdd;
        this.totalPoints += pointsToAdd;
        
        // Check if ranked up - now using level-specific point requirements
        if (this.rankPoints[level - 1] >= pointRequirement && level === this.unlockedRanks && level < this.rankNames.length) {
            this.unlockedRanks++;
        }
        
        this.saveData();
        updateRankUI();
    }
};

// DOM Elements
const playButton = document.getElementById('playButton');
const rankSystem = document.getElementById('rankSystem');
const statsButton = document.getElementById('statsButton');
const helpButton = document.getElementById('helpButton');
const statsPanel = document.getElementById('statsPanel');
const helpPanel = document.getElementById('helpPanel');
const lobby = document.getElementById('lobby');
const gameContainer = document.getElementById('gameContainer');
const returnToLobby = document.getElementById('returnToLobby');
const closePanelButtons = document.querySelectorAll('.close-panel');
const rankItems = document.querySelectorAll('.rank-item');
const videoBackground = document.getElementById('video-background');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    gameData.loadData();
    updateRankUI();
    updateStatsUI();
});

// Update UI based on game data
function updateRankUI() {
    const rankItems = document.querySelectorAll('.rank-item');
    
    rankItems.forEach((item, index) => {
        const level = index + 1;
        const points = gameData.rankPoints[index];
        const pointRequirement = gameData.rankPointRequirements[index];
        
        // Lock/unlock ranks
        if (level > gameData.unlockedRanks) {
            item.classList.add('locked');
            item.setAttribute('data-unlocked', 'false');
        } else {
            item.classList.remove('locked');
            item.setAttribute('data-unlocked', 'true');
        }

        // Update progress in the rank list with level-specific point requirements
        const pointsElement = item.querySelector('.rank-points');
        if (pointsElement) {
            pointsElement.textContent = `${Math.min(points, pointRequirement)}/${pointRequirement} PTS`;
        }
    });

    // Update active rank display
    updateRankDisplay(document.querySelector('.rank-item.active'));
}

function updateRankDisplay(rankElement) {
    if (!rankElement) return;
    
    const level = parseInt(rankElement.getAttribute('data-level'));
    const rankName = gameData.rankNames[level - 1];
    const points = gameData.rankPoints[level - 1];
    const pointRequirement = gameData.rankPointRequirements[level - 1];
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text span:first-child');
    const progressNeeded = document.querySelector('.progress-text span:last-child');
    const playButton = document.querySelector('.play-level-btn');
    const imageType = rankElement.getAttribute('data-image');
    
    // Update display elements
    document.querySelector('.rank-title').textContent = rankName;
    
    // Update progress bar - now using level-specific point requirements
    progressFill.style.width = `${Math.min(points, pointRequirement) / pointRequirement * 100}%`;
    progressText.textContent = `${Math.min(points, pointRequirement)} PTS`;
    progressNeeded.textContent = `${pointRequirement} PTS NEEDED`;
    
    // Update play button
    playButton.setAttribute('data-level', level);
    if (rankElement.classList.contains('locked')) {
        playButton.disabled = true;
        playButton.textContent = 'LOCKED';
    } else if (points >= pointRequirement) {
        playButton.disabled = false;
        playButton.textContent = 'REPLAY CHALLENGE';
    } else {
        playButton.disabled = false;
        playButton.textContent = 'START CHALLENGE';
    }

    // Set correct rank image based on the data-image attribute
    document.querySelector('.rank-preview').style.backgroundImage = `url('./assets/ranks/${imageType}.png')`;
}

function updateStatsUI() {
    document.getElementById('arrowsFired').textContent = gameData.stats.arrowsFired;
    document.getElementById('enemiesDefeated').textContent = gameData.stats.enemiesDefeated;
    
    const accuracy = gameData.stats.arrowsFired > 0 
        ? Math.round((gameData.stats.enemiesDefeated / gameData.stats.arrowsFired) * 100) 
        : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    
    document.getElementById('highestRank').textContent = gameData.rankNames[gameData.unlockedRanks - 1];
    document.getElementById('totalPoints').textContent = gameData.totalPoints;
}

// Switch background video
function switchBackgroundVideo(videoSrc) {
    const currentSrc = videoBackground.querySelector('source').src;
    if (currentSrc !== videoSrc) {
        videoBackground.pause();
        videoBackground.querySelector('source').src = videoSrc;
        videoBackground.load();
        videoBackground.play();
    }
}

// Event Listeners
playButton.addEventListener('click', () => {
    // Switch to rank selection video
    switchBackgroundVideo('./assets/Play-Lobby.mp4');
    rankSystem.classList.remove('hidden');
    playButton.classList.add('hidden');
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

// Rank item selection
rankItems.forEach(item => {
    item.addEventListener('click', () => {
        if (item.classList.contains('locked')) return;
        
        // Update active state
        document.querySelectorAll('.rank-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        
        // Update rank display
        updateRankDisplay(item);
    });
});

// Start game from rank display
document.querySelector('.play-level-btn').addEventListener('click', function() {
    const level = parseInt(this.getAttribute('data-level'));
    if (level <= gameData.unlockedRanks) {
        startGame(level);
    }
});

// Navbar link active state
document.querySelectorAll('.navbar-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.navbar-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Home link
document.getElementById('homeLink').addEventListener('click', function() {
    document.querySelectorAll('.panel').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Return to main lobby
    rankSystem.classList.add('hidden');
    playButton.classList.remove('hidden');
    
    // Switch back to home video
    switchBackgroundVideo('./assets/Home.mp4');
});

document.getElementById('settingsLink').addEventListener('click', function() {
    // Implement settings functionality if needed
    alert('Settings panel is coming soon!');
});

returnToLobby.addEventListener('click', () => {
    endGame();
});

// Game control functions
function startGame(level) {
    gameData.currentRank = level;
    document.getElementById('currentLevel').textContent = gameData.rankNames[level - 1];
    
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
    
    // Return to main screen
    rankSystem.classList.add('hidden');
    playButton.classList.remove('hidden');
    
    // Switch back to home video
    switchBackgroundVideo('./assets/Home.mp4');
    
    // Stop the game
    if (window.stopGame) {
        window.stopGame();
    }
}

// Interface for game.js to report back level completion
window.reportLevelComplete = function(level, points) {
    const pointRequirement = gameData.rankPointRequirements[level - 1];
    gameData.addPoints(level, points);
    
    // Show level complete message with the appropriate point value
    setTimeout(() => {
        const message = `${gameData.rankNames[level - 1]} Challenge Complete!\nPoints earned: ${pointRequirement}`;
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
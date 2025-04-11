const gameData = {
    currentRank: 1,
    unlockedRanks: 1,
    totalRR: 0,
    // RR for each level
    rankRR: [0, 0, 0, 0, 0, 0, 0], 
    // Level identifiers
    rankLevels: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7"],
    // RR requirements for each level - all set to 50 now
    rankRRRequirements: [50, 50, 50, 50, 50, 50, 50],
    stats: {
        arrowsFired: 0,
        enemiesDefeated: 0,
        gamesPlayed: 0
    },
    saveData() {
        localStorage.setItem('sovaArcheryData', JSON.stringify({
            unlockedRanks: this.unlockedRanks,
            rankRR: this.rankRR,
            totalRR: this.totalRR,
            stats: this.stats
        }));
    },
    loadData() {
        const saved = localStorage.getItem('sovaArcheryData');
        if (saved) {
            const data = JSON.parse(saved);
            this.unlockedRanks = data.unlockedRanks || 1;
            this.rankRR = data.rankRR || [0, 0, 0, 0, 0, 0, 0];
            this.totalRR = data.totalRR || 0;
            this.stats = data.stats || {
                arrowsFired: 0,
                enemiesDefeated: 0,
                gamesPlayed: 0
            };
        }
    },
    addRR(level) {
        // Each level gives 50 RR when completed
        const rrToAdd = this.rankRRRequirements[level - 1];
        
        this.rankRR[level - 1] += rrToAdd;
        this.totalRR += rrToAdd;
        
        // Check if we should unlock the next level
        if (level === this.unlockedRanks && level < this.rankLevels.length) {
            this.unlockedRanks++;
        }
        
        this.saveData();
        updateRankUI();
    },
    // Calculate level progress for UI display
    getLevelProgress(level) {
        const current = this.rankRR[level - 1];
        const required = this.rankRRRequirements[level - 1];
        
        return {
            current: Math.min(current, required),
            required: required,
            percentage: Math.min(current / required * 100, 100)
        };
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
        const levelProgress = gameData.getLevelProgress(level);
        
        // Lock/unlock ranks
        if (level > gameData.unlockedRanks) {
            item.classList.add('locked');
            item.setAttribute('data-unlocked', 'false');
        } else {
            item.classList.remove('locked');
            item.setAttribute('data-unlocked', 'true');
        }

        // Update progress in the rank list
        const rrElement = item.querySelector('.rank-rr');
        if (rrElement) {
            rrElement.textContent = `${levelProgress.current}/${levelProgress.required} RR`;
        }
    });

    // Update active rank display
    updateRankDisplay(document.querySelector('.rank-item.active'));
}

function updateRankDisplay(rankElement) {
    if (!rankElement) return;
    
    const level = parseInt(rankElement.getAttribute('data-level'));
    const levelName = gameData.rankLevels[level - 1];
    const levelProgress = gameData.getLevelProgress(level);
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text span:first-child');
    const progressNeeded = document.querySelector('.progress-text span:last-child');
    const playButton = document.querySelector('.play-level-btn');
    const imageType = rankElement.getAttribute('data-image');
    
    // Update title with level
    document.querySelector('.rank-title').textContent = levelName;
    
    // Remove subtitle since we don't have tiers anymore
    const subtitle = document.querySelector('.rank-subtitle');
    if (subtitle) subtitle.remove();
    
    // Update progress bar
    progressFill.style.width = `${levelProgress.percentage}%`;
    progressText.textContent = `${levelProgress.current} RR`;
    progressNeeded.textContent = `${levelProgress.required} RR NEEDED`;
    
    // Update play button
    playButton.setAttribute('data-level', level);
    if (rankElement.classList.contains('locked')) {
        playButton.disabled = true;
        playButton.textContent = 'LOCKED';
    } else {
        playButton.disabled = false;
        playButton.textContent = 'START CHALLENGE';
    }

    // Set correct rank image
    document.querySelector('.rank-preview').style.backgroundImage = `url('./assets/ranks/${imageType}.png')`;
    
    // Update rank description
    const descriptionText = getRankDescription(levelName);
    document.querySelector('.rank-description').textContent = descriptionText;
}

function updateStatsUI() {
    document.getElementById('arrowsFired').textContent = gameData.stats.arrowsFired;
    document.getElementById('enemiesDefeated').textContent = gameData.stats.enemiesDefeated;
    
    const accuracy = gameData.stats.arrowsFired > 0 
        ? Math.round((gameData.stats.enemiesDefeated / gameData.stats.arrowsFired) * 100) 
        : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    
    document.getElementById('highestRank').textContent = `Level ${gameData.unlockedRanks}`;
    document.getElementById('totalPoints').textContent = gameData.totalRR;
}

// Get descriptive text for each level
function getRankDescription(levelName) {
    switch(levelName) {
        case 'Level 1':
            return "The first level in Sova's Archery Challenge. Focus on mastering basic bow control. Hit stationary targets to build accuracy.";
        case 'Level 2':
            return "Targets will begin to move in simple patterns. Tests your ability to predict and lead your shots with precision.";
        case 'Level 3':
            return "Presents advanced challenges with multiple targets. Requires quick decision making and prioritization.";
        case 'Level 4':
            return "Introduces defensive obstacles that will require careful aim and timing to overcome.";
        case 'Level 5':
            return "Advanced moving targets with unpredictable patterns. Tests your reflexes and adaptability.";
        case 'Level 6':
            return "High-speed challenges with multiple moving targets. Requires perfect accuracy and timing.";
        case 'Level 7':
            return "The ultimate test of archery mastery. Combines all previous challenges with increased difficulty.";
        default:
            return "Master the basics of bow control to progress. Every shot counts.";
    }
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
    
    // Show the level name in the HUD
    const levelName = gameData.rankLevels[level - 1];
    document.getElementById('currentLevel').textContent = levelName;
    
    // Update enemy count in HUD based on level
    const enemyCount = 3 + Math.floor(level / 2); // Example: more enemies at higher levels
    document.getElementById('enemyCount').textContent = enemyCount;
    
    // Pause music
    if (window.lobbyMusic) lobbyMusic.pause();
    if (window.rankMusic) rankMusic.pause();

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
    
    // Resume appropriate music
    if (window.lobbyMusic && rankSystem.classList.contains('hidden')) {
        lobbyMusic.currentTime = 0; // Optional: restart from beginning
        lobbyMusic.play().catch(e => console.error(e));
    } else if (window.rankMusic) {
        rankMusic.currentTime = 0; // Optional: restart from beginning
        rankMusic.play().catch(e => console.error(e));
    }

    // Stop the game
    if (window.stopGame) {
        window.stopGame();
    }
}

// Interface for game.js to report back level completion
window.reportLevelComplete = function(level) {
    gameData.addRR(level);
    
    // Show level complete message with the appropriate RR value
    setTimeout(() => {
        const rrEarned = gameData.rankRRRequirements[level - 1];
        const levelName = gameData.rankLevels[level - 1];
        const message = `${levelName} Complete!\nRR earned: ${rrEarned}`;
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
// gameController.js - Manages game flow and state transitions

import gameData from './gameData.js';
import audioManager from './audioManager.js';
import { updateRankUI, updateStatsUI, switchBackgroundVideo } from './uiManager.js';

// Game flow functions
function startGame(level) {
    gameData.currentRank = level;
    
    // UI elements
    const lobby = document.getElementById('lobby');
    const gameContainer = document.getElementById('gameContainer');
    const currentLevel = document.getElementById('currentLevel');
    const enemyCount = document.getElementById('enemyCount');
    
    // Update HUD
    if (currentLevel) currentLevel.textContent = gameData.rankLevels[level - 1];
    
    // Update enemy count in HUD based on level
    const enemyGoal = 3 + Math.floor(level / 2); // Example: more enemies at higher levels
    if (enemyCount) enemyCount.textContent = enemyGoal;
    
    // Pause music instead of stopping
    audioManager.pause('lobbyMusic');
    audioManager.pause('rankMusic');

    // Switch visibility
    if (lobby) lobby.classList.add('hidden');
    if (gameContainer) gameContainer.classList.remove('hidden');
    
    // Initialize the game with level data
    if (window.initGame) window.initGame(level);
}

function endGame() {
    // UI elements
    const lobby = document.getElementById('lobby');
    const gameContainer = document.getElementById('gameContainer');
    const rankSystem = document.getElementById('rankSystem');
    const playButton = document.getElementById('playButton');
    
    // Switch visibility
    if (gameContainer) gameContainer.classList.add('hidden');
    if (lobby) lobby.classList.remove('hidden');
    if (rankSystem) rankSystem.classList.add('hidden');
    if (playButton) playButton.classList.remove('hidden');
    
    // Switch back to home video
    switchBackgroundVideo('./assets/background/Home.mp4');
    
    // Resume lobby music
    audioManager.play('lobbyMusic');

    // Stop the game
    if (window.stopGame) window.stopGame();
}

function reportLevelComplete(level) {
    gameData.addRR(level);
    updateRankUI();
    
    // Show level complete message with the appropriate RR value
    setTimeout(() => {
        const rrEarned = gameData.rankRRRequirements[level - 1];
        const levelName = gameData.rankLevels[level - 1];
        const message = `${levelName} Complete!\nRR earned: ${rrEarned}`;
        alert(message);
        endGame();
    }, 1000);
}

function updateGameStats(arrowsFired, enemiesDefeated) {
    gameData.updateGameStats(arrowsFired, enemiesDefeated);
}

// Setup the global interfaces for the game engine to call
function setupGlobalInterfaces() {
    window.reportLevelComplete = reportLevelComplete;
    window.updateGameStats = updateGameStats;
}

export {
    startGame,
    endGame,
    reportLevelComplete,
    updateGameStats,
    setupGlobalInterfaces
};
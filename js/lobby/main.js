// main.js - Entry point for the application

import gameData from './gameData.js';
import audioManager from './audioManager.js';
import { updateRankUI, updateStatsUI } from './uiManager.js';
import { setupGlobalInterfaces } from './gameController.js';
import { setupEventListeners, setupLoadingScreen } from './eventHandler.js';

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game data
    gameData.loadData();
    
    // Initialize audio manager
    audioManager.init();
    
    // Update UI
    updateRankUI();
    updateStatsUI();
    
    // Set up global interfaces for the game engine
    setupGlobalInterfaces();
    
    // Set up loading screen
    setupLoadingScreen();
    
    // Set up event listeners
    setupEventListeners();
});
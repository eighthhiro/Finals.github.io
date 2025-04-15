// eventHandler.js - Set up all event listeners

import gameData from './gameData.js';
import audioManager from './audioManager.js';
import { updateRankUI, updateRankDisplay, updateStatsUI, switchBackgroundVideo } from './uiManager.js';
import { startGame, endGame } from './gameController.js';

// Set up all event listeners
function setupEventListeners() {
    // Frequently used elements
    const elements = {
        playButton: document.getElementById('playButton'),
        rankSystem: document.getElementById('rankSystem'),
        statsButton: document.getElementById('statsButton'),
        helpButton: document.getElementById('helpButton'),
        statsPanel: document.getElementById('statsPanel'),
        helpPanel: document.getElementById('helpPanel'),
        lobby: document.getElementById('lobby'),
        homeLink: document.getElementById('homeLink'),
        returnToLobby: document.getElementById('returnToLobby'),
        closePanelButtons: document.querySelectorAll('.close-panel'),
        rankItems: document.querySelectorAll('.rank-item'),
        navbarLinks: document.querySelectorAll('.navbar-link'),
        settingsLink: document.getElementById('settingsLink'),
        settingsPanel: document.getElementById('settingsPanel'),
        volumeControl: document.getElementById('volumeControl'),
        resetProgress: document.getElementById('resetProgress'),
        confirmationDialog: document.getElementById('confirmationDialog'),
        confirmReset: document.getElementById('confirmReset'),
        cancelReset: document.getElementById('cancelReset')
    };
    
    // Main navigation
    if (elements.playButton) {
        elements.playButton.addEventListener('click', () => {
            // Switch to rank selection video
            switchBackgroundVideo('./assets/background/Play-Lobby.mp4');
            if (elements.rankSystem) elements.rankSystem.classList.remove('hidden');
            elements.playButton.classList.add('hidden');
            
            // Hide beta note when showing rank selection
            const betaNote = document.querySelector('.beta-note');
            if (betaNote) betaNote.classList.add('hidden');
            
            // Switch music - pause lobby, play rank
            audioManager.pause('lobbyMusic');
            audioManager.play('rankMusic');
        });
    }
    
    // Stats and help panels
    if (elements.statsButton) {
        elements.statsButton.addEventListener('click', () => {
            updateStatsUI();
            if (elements.statsPanel) elements.statsPanel.classList.remove('hidden');
        });
    }
    
    if (elements.helpButton) {
        elements.helpButton.addEventListener('click', () => {
            if (elements.helpPanel) elements.helpPanel.classList.remove('hidden');
        });
    }
    
    // Close panel buttons
    elements.closePanelButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.add('hidden');
            });
        });
    });
    
    // Rank selection
    elements.rankItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('locked')) return;
            
            // Update active state
            elements.rankItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            // Update rank display
            updateRankDisplay(item);
        });
    });
    
    // Play level button
    const playLevelBtn = document.querySelector('.play-level-btn');
    if (playLevelBtn) {
        playLevelBtn.addEventListener('click', function() {
            const level = parseInt(this.getAttribute('data-level'));
            if (level <= gameData.unlockedRanks) {
                startGame(level);
            }
        });
    }
    
    // Return to lobby
    if (elements.returnToLobby) {
        elements.returnToLobby.addEventListener('click', () => {
            endGame();
        });
    }
    
    // Navbar links
    elements.navbarLinks.forEach(link => {
        link.addEventListener('click', function() {
            elements.navbarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Home link
    if (elements.homeLink) {
        elements.homeLink.addEventListener('click', () => {
            // Hide all panels
            document.querySelectorAll('.panel').forEach(el => {
                el.classList.add('hidden');
            });
            
            // Return to main lobby
            if (elements.rankSystem) {
                elements.rankSystem.classList.add('hidden');
                // Updated: pause rankMusic instead of stopping it
                audioManager.pause('rankMusic');
                audioManager.play('lobbyMusic');
            }
            
            if (elements.playButton) elements.playButton.classList.remove('hidden');
            
            // Show beta note again when returning to home
            const betaNote = document.querySelector('.beta-note');
            if (betaNote) betaNote.classList.remove('hidden');
            
            // Switch back to home video
            switchBackgroundVideo('./assets/background/Home.mp4');
        });
    }
    
    // Settings
    if (elements.settingsLink) {
        elements.settingsLink.addEventListener('click', () => {
            if (elements.settingsPanel) elements.settingsPanel.classList.remove('hidden');
        });
    }
    
    if (elements.volumeControl) {
        elements.volumeControl.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            audioManager.setVolume(volume);
        });
    }
    
    if (elements.resetProgress) {
        elements.resetProgress.addEventListener('click', () => {
            if (elements.confirmationDialog) elements.confirmationDialog.classList.remove('hidden');
        });
    }
    
    if (elements.confirmReset) {
        elements.confirmReset.addEventListener('click', () => {
            gameData.reset();
            updateRankUI();
            updateStatsUI();
            if (elements.confirmationDialog) elements.confirmationDialog.classList.add('hidden');
        });
    }
    
    if (elements.cancelReset) {
        elements.cancelReset.addEventListener('click', () => {
            if (elements.confirmationDialog) elements.confirmationDialog.classList.add('hidden');
        });
    }
    
    // Handle visibility change to pause/resume music
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Only pause current music when tab is inactive
            const currentMusic = audioManager.getCurrentlyPlaying();
            if (currentMusic) {
                audioManager.pause(currentMusic);
            }
        } else {
            // Resume the music that was playing before
            audioManager.resume();
        }
    });
}

// Loading screen setup
function setupLoadingScreen() {
    const loadingElement = document.getElementById('loading');
    const confirmButton = document.getElementById('confirmSound');
    
    if (loadingElement) loadingElement.style.display = 'flex';
    
    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            // Play loading sound
            audioManager.play('loadingSound')
                .then(() => console.log("Audio playback started"))
                .catch(e => console.error("Audio playback failed:", e));
            
            // Hide headphones notice
            const notice = document.querySelector('.headphones-notice');
            if (notice) notice.style.display = 'none';
            
            // Hide loading screen after delay
            setTimeout(() => {
                if (loadingElement) loadingElement.style.display = 'none';
            }, 8000);
        });
    }
    
    // Start lobby music when loading sound ends
    const loadingSound = document.getElementById('loadingSound');
    if (loadingSound) {
        loadingSound.addEventListener('ended', () => {
            audioManager.play('lobbyMusic');
        });
    }
}

export {
    setupEventListeners,
    setupLoadingScreen
};
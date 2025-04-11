// Handle loading screen
document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading');
    const confirmButton = document.getElementById('confirmSound');
    const lobbyMusic = document.getElementById('lobbyMusic');
    const rankMusic = document.getElementById('rankMusic');
    const playButton = document.getElementById('playButton');
    const rankSystem = document.getElementById('rankSystem');
    const returnToLobby = document.getElementById('returnToLobby');
    
    // Show loading screen immediately
    loadingElement.style.display = 'flex';
    
    confirmButton.addEventListener('click', function() {
    // Play sound when user clicks OK
    loadingSound.play().then(() => {
        console.log("Audio playback started");
    }).catch(e => {
        console.error("Audio playback failed:", e);
    });
    
    // Remove the headphones notice
    document.querySelector('.headphones-notice').style.display = 'none';
    
    // Hide loading screen after delay
    setTimeout(function() {
        loadingElement.style.display = 'none';
    }, 8000);
    });

    const musicVolume = 0.3; // Music Volume

    // Set initial volumes
    lobbyMusic.volume = musicVolume;
    rankMusic.volume = musicVolume;
    
    // Settings elements
    const settingsLink = document.getElementById('settingsLink');
    const settingsPanel = document.getElementById('settingsPanel');
    const volumeControl = document.getElementById('volumeControl');
    const volumeValue = document.getElementById('volumeValue');
    const resetProgress = document.getElementById('resetProgress');
    const confirmationDialog = document.getElementById('confirmationDialog');
    const confirmReset = document.getElementById('confirmReset');
    const cancelReset = document.getElementById('cancelReset');

    // Initialize volume
    function initializeVolume() {
        const savedVolume = localStorage.getItem('gameVolume');
        const volume = savedVolume !== null ? parseFloat(savedVolume) : 1;
        
        volumeControl.value = volume;
        updateVolumeDisplay(volume);
        setVolume(volume);
    }

    // Update volume display
    function updateVolumeDisplay(value) {
        const percentage = Math.round(value * 100);
        volumeValue.textContent = `${percentage}%`;
    }

    // Set volume for all audio elements
    function setVolume(value) {
        lobbyMusic.volume = value;
        rankMusic.volume = value;
        loadingSound.volume = value;
        
        // Save volume to localStorage
        localStorage.setItem('gameVolume', value);
    }

    // Reset all progress
    function resetAllProgress() {
        gameData.unlockedRanks = 1;
        gameData.rankPoints = [0, 0, 0, 0, 0, 0, 0];
        gameData.totalPoints = 0;
        gameData.stats = {
            arrowsFired: 0,
            enemiesDefeated: 0,
            gamesPlayed: 0
        };
        gameData.saveData();
        
        // Update UI
        updateRankUI();
        updateStatsUI();
        
        // Show confirmation message
        alert('All progress has been reset.');
    }

    // Event listeners for settings
    settingsLink.addEventListener('click', () => {
        settingsPanel.classList.remove('hidden');
    });

    volumeControl.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        updateVolumeDisplay(volume);
        setVolume(volume);
    });

    resetProgress.addEventListener('click', () => {
        confirmationDialog.classList.remove('hidden');
    });

    confirmReset.addEventListener('click', () => {
        resetAllProgress();
        confirmationDialog.classList.add('hidden');
    });

    cancelReset.addEventListener('click', () => {
        confirmationDialog.classList.add('hidden');
    });

    // Initialize settings when DOM loads
    document.addEventListener('DOMContentLoaded', () => {
        initializeVolume();
    });

    // Start lobby music when loading is complete
    const loadingSound = document.getElementById('loadingSound');
    loadingSound.addEventListener('ended', function() {
        lobbyMusic.play().catch(e => console.error("Lobby music playback failed:", e));
    });
    
    // Handle play button click to switch to rank selection
    playButton.addEventListener('click', function() {
        lobbyMusic.pause();
        rankMusic.play().catch(e => console.error("Rank music playback failed:", e));
        rankSystem.classList.remove('hidden');
    });
    
    // Handle return to lobby from rank selection
    if (returnToLobby) {
        returnToLobby.addEventListener('click', function() {
            rankMusic.pause();
            lobbyMusic.play().catch(e => console.error("Lobby music playback failed:", e));
            rankSystem.classList.add('hidden');
        });
    }
    
    // Handle navigation between panels
    const homeLink = document.getElementById('homeLink');
    if (homeLink) {
        homeLink.addEventListener('click', function() {
            // If coming from rank selection, switch music
            if (!rankSystem.classList.contains('hidden')) {
                rankMusic.pause();
                lobbyMusic.play().catch(e => console.error("Lobby music playback failed:", e));
            }
            rankSystem.classList.add('hidden');
        });
    }

    if (homeLink) {
        homeLink.addEventListener('click', function() {
            // Pause rank selection music
            rankMusic.pause();
            
            // Play lobby music (only if not already playing)
            if (lobbyMusic.paused) {
                lobbyMusic.currentTime = 0; // Optional: restart lobby music from beginning
                lobbyMusic.play().catch(e => console.error("Lobby music playback failed:", e));
            }
            
            // Hide rank selection
            rankSystem.classList.add('hidden');
            
            // Remove active class from other navbar links if needed
            document.querySelectorAll('.navbar-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        });
    }

    // Pause music when tab is inactive
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            lobbyMusic.pause();
            rankMusic.pause();
        } else {
            // Resume appropriate music based on current view
            if (rankSystem.classList.contains('hidden')) {
                lobbyMusic.play().catch(e => console.error("Lobby music playback failed:", e));
            } else {
                rankMusic.play().catch(e => console.error("Rank music playback failed:", e));
            }
        }
    });
});
// audioManager.js - Improved Audio Management

class AudioManager {
    constructor() {
        this.elements = {};
        this.volume = 0.3;
        this.currentlyPlaying = null;
    }
    
    init() {
        // Get audio elements
        this.elements = {
            lobbyMusic: document.getElementById('lobbyMusic'),
            rankMusic: document.getElementById('rankMusic'),
            loadingSound: document.getElementById('loadingSound')
        };
        
        // Initialize volume
        const savedVolume = localStorage.getItem('gameVolume');
        this.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.3;
        this.updateAllVolumes();  
    }
    
    updateAllVolumes() {
        // Set volume for all audio elements
        Object.values(this.elements).forEach(audio => {
            if (audio) audio.volume = this.volume;
        });
        
        // Update UI if visible
        const volumeControl = document.getElementById('volumeControl');
        const volumeValue = document.getElementById('volumeValue');
        
        if (volumeControl) volumeControl.value = this.volume;
        if (volumeValue) {
            const percentage = Math.round(this.volume * 100);
            volumeValue.textContent = `${percentage}%`;
        }
        
        // Save to localStorage
        localStorage.setItem('gameVolume', this.volume);
    }
    
    setVolume(value) {
        this.volume = value;
        this.updateAllVolumes();
    }
    
    play(type) {
        const audio = this.elements[type];
        if (!audio) return Promise.reject(`Audio element ${type} not found`);
        
        // Pause other music if needed, but don't reset their position
        if (type === 'lobbyMusic' && this.elements.rankMusic) {
            this.elements.rankMusic.pause();
        }
        if (type === 'rankMusic' && this.elements.lobbyMusic) {
            this.elements.lobbyMusic.pause();
        }
        
        // Track what's currently playing
        this.currentlyPlaying = type;
        
        // Play without resetting if it was just paused
        return audio.play().catch(e => console.error(`${type} playback failed:`, e));
    }
    
    pause(type) {
        const audio = this.elements[type];
        if (!audio) return;
        
        audio.pause();
        // Don't reset the position to allow resuming
    }
    
    stop(type) {
        const audio = this.elements[type];
        if (!audio) return;
        
        audio.pause();
        // Reset to beginning
        audio.currentTime = 0;
        
        if (this.currentlyPlaying === type) {
            this.currentlyPlaying = null;
        }
    }
    
    getCurrentlyPlaying() {
        return this.currentlyPlaying;
    }
    
    resume() {
        // Resume whatever was playing last
        if (this.currentlyPlaying && this.elements[this.currentlyPlaying]) {
            this.elements[this.currentlyPlaying].play()
                .catch(e => console.error(`Resume playback failed:`, e));
        }
    }
}

// Create singleton instance
const audioManager = new AudioManager();

export default audioManager;
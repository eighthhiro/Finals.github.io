// uiManager.js - Functions to update and manage UI elements

import gameData from './gameData.js';

// UI Functions
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

        // Add/remove completed class based on RR
        if (levelProgress.current >= levelProgress.required) {
            item.classList.add('completed');
        } else {
            item.classList.remove('completed');
        }
    });

    // Update active rank display
    const activeRank = document.querySelector('.rank-item.active');
    if (activeRank) updateRankDisplay(activeRank);
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
    if (progressFill) {
        progressFill.style.width = `${levelProgress.percentage}%`;
        
        if (levelProgress.current >= levelProgress.required) {
            progressFill.style.backgroundColor = '#4CAF50'; // Green
        } else {
            progressFill.style.backgroundColor = ''; // Default color
        }
    }
    if (progressText) progressText.textContent = `${levelProgress.current} RR`;
    if (progressNeeded) progressNeeded.textContent = `${levelProgress.required} RR NEEDED`;
    
    // Update play button
    if (playButton) {
        playButton.setAttribute('data-level', level);
        if (rankElement.classList.contains('locked')) {
            playButton.disabled = true;
            playButton.textContent = 'LOCKED';
        } else {
            playButton.disabled = false;
            playButton.textContent = 'START CHALLENGE';
        }
    }

    // Set correct rank image
    const rankPreview = document.querySelector('.rank-preview');
    if (rankPreview) rankPreview.style.backgroundImage = `url('./assets/ranks/${imageType}.png')`;
    
    // Update rank description
    const descriptionEl = document.querySelector('.rank-description');
    if (descriptionEl) descriptionEl.textContent = getRankDescription(levelName);
}

function updateStatsUI() {
    const elements = {
        arrowsFired: document.getElementById('arrowsFired'),
        enemiesDefeated: document.getElementById('enemiesDefeated'),
        accuracy: document.getElementById('accuracy'),
        highestRank: document.getElementById('highestRank'),
        totalPoints: document.getElementById('totalPoints')
    };
    
    // Update stats if elements exist
    if (elements.arrowsFired) elements.arrowsFired.textContent = gameData.stats.arrowsFired;
    if (elements.enemiesDefeated) elements.enemiesDefeated.textContent = gameData.stats.enemiesDefeated;
    
    if (elements.accuracy) {
        const accuracy = gameData.stats.arrowsFired > 0 
            ? Math.round((gameData.stats.enemiesDefeated / gameData.stats.arrowsFired) * 100) 
            : 0;
        elements.accuracy.textContent = `${accuracy}%`;
    }
    
    if (elements.highestRank) elements.highestRank.textContent = `Level ${gameData.unlockedRanks}`;
    if (elements.totalPoints) elements.totalPoints.textContent = gameData.totalRR;
}

function getRankDescription(levelName) {
    const descriptions = {
        'Level 1': "The first level in Sova's Archery Challenge. Focus on mastering basic bow control. Hit stationary targets to build accuracy.",
        'Level 2': "Targets will begin to move in simple patterns. Tests your ability to predict and lead your shots with precision.",
        'Level 3': "Presents advanced challenges with multiple targets. Requires quick decision making and prioritization.",
        'Level 4': "Introduces defensive obstacles that will require careful aim and timing to overcome.",
        'Level 5': "Advanced moving targets with unpredictable patterns. Tests your reflexes and adaptability.",
        'Level 6': "High-speed challenges with multiple moving targets. Requires perfect accuracy and timing.",
        'Level 7': "The ultimate test of archery mastery. Combines all previous challenges with increased difficulty."
    };
    
    return descriptions[levelName] || "Master the basics of bow control to progress. Every shot counts.";
}

function switchBackgroundVideo(videoSrc) {
    const videoBackground = document.getElementById('video-background');
    if (!videoBackground) return;
    
    const source = videoBackground.querySelector('source');
    if (!source) return;
    
    if (source.src !== videoSrc) {
        videoBackground.pause();
        source.src = videoSrc;
        videoBackground.load();
        videoBackground.play().catch(e => console.error("Video playback failed:", e));
    }
}

export {
    updateRankUI,
    updateRankDisplay,
    updateStatsUI,
    getRankDescription,
    switchBackgroundVideo
};
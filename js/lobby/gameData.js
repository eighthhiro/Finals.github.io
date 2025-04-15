// gameData.js - Core functionality for storing and managing game state

class GameData {
    constructor() {
        this.currentRank = 1;
        this.unlockedRanks = 1;
        this.totalRR = 0;
        // RR for each level
        this.rankRR = [0, 0, 0, 0, 0, 0, 0];
        // Level identifiers
        this.rankLevels = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7"];
        // RR requirements for each level
        this.rankRRRequirements = [50, 50, 50, 50, 50, 50, 50];
        this.stats = {
            arrowsFired: 0,
            enemiesDefeated: 0,
            gamesPlayed: 0
        };
    }
    
    saveData() {
        localStorage.setItem('sovaArcheryData', JSON.stringify({
            unlockedRanks: this.unlockedRanks,
            rankRR: this.rankRR,
            totalRR: this.totalRR,
            stats: this.stats
        }));
    }
    
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
    }
    
    addRR(level) {
        const rrToAdd = this.rankRRRequirements[level - 1];
        this.rankRR[level - 1] += rrToAdd;
        this.totalRR += rrToAdd;
        
        // Check if we should unlock the next level
        if (level === this.unlockedRanks && level < this.rankLevels.length) {
            this.unlockedRanks++;
        }
        
        this.saveData();
    }
    
    getLevelProgress(level) {
        const current = this.rankRR[level - 1];
        const required = this.rankRRRequirements[level - 1];
        
        return {
            current: Math.min(current, required),
            required: required,
            percentage: Math.min(current / required * 100, 100)
        };
    }
    
    reset() {
        this.unlockedRanks = 1;
        this.rankRR = [0, 0, 0, 0, 0, 0, 0];
        this.totalRR = 0;
        this.stats = {
            arrowsFired: 0,
            enemiesDefeated: 0,
            gamesPlayed: 0
        };
        this.saveData();
        
        // Show confirmation message
        alert('All progress has been reset.');
    }
    
    updateGameStats(arrowsFired, enemiesDefeated) {
        this.stats.arrowsFired += arrowsFired;
        this.stats.enemiesDefeated += enemiesDefeated;
        this.stats.gamesPlayed++;
        this.saveData();
    }
}

// Create singleton instance
const gameData = new GameData();

export default gameData;
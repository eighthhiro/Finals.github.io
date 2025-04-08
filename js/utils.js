// utils.js - Utility functions
import { gameState } from './gameState.js';
import { canvas } from './main.js';
import { ground, sova, bomb, obstacles } from './levelBuilder.js';

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (ground) {
        ground.y = canvas.height - 80;
        ground.width = canvas.width;
    }
    
    if (sova) {
        sova.y = canvas.height - 200;
    }
    
    if (bomb) {
        bomb.y = canvas.height - 120;
    }
    
    if (obstacles.length > 0) {
        obstacles.forEach((obstacle, index) => {
            // Find which stack this obstacle belongs to
            let stackIndex = 0;
            let boxesInStack = 1;
            let boxHeight = obstacle.height;
            
            // Calculate the height position based on box position in the stack
            obstacle.y = canvas.height - 80 - boxHeight * (boxesInStack - stackIndex);
        });
    }
    
    if (gameState.defenders.length > 0) {
        gameState.defenders.forEach(defender => {
            defender.y = canvas.height - 80 - 120 + 10; // Account for floating effect
        });
    }
}
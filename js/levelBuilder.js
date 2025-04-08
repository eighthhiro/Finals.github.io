// levelBuilder.js - Level creation and management
import { gameState } from './gameState.js';
import { canvas } from './main.js';
import { images } from './assetLoader.js';

export let ground, sova, bomb, obstacles = [];

export function initializeLevel(level) {
    const config = gameState.levelConfigs[level];
    
    // Setup ground
    ground = {
        x: 0,
        y: canvas.height - 80,
        width: canvas.width,
        height: 80,
        color: 'rgba(46, 46, 46)'
    };
    
    // Setup Sova character
    sova = {
        x: 100,
        y: canvas.height - 200,
        width: 140,
        height: 140,
        color: '#00f0ff',
        image: images.sova
    };
    
    // Setup bomb/spike
    bomb = {
        x: config.bomb.x,
        y: canvas.height - 120,
        width: 40,
        height: 40,
        planted: true,
        defused: false,
        defuseTime: config.bomb.defuseTime,
        defuseStartTime: null,
        defuserNearby: false,
        image: images.spike
    };
    
    // Setup obstacles as stacked boxes
    obstacles = [];
    const boxSize = 60; // Standard box size
    
    config.obstacles.forEach(obstacle => {
        for (let i = 0; i < obstacle.boxes; i++) {
            obstacles.push({
                x: obstacle.x,
                y: canvas.height - 80 - boxSize * (i + 1), // Stack boxes vertically
                width: boxSize,
                height: boxSize,
                color: '#8B4513',
                type: 'box',
                image: images.box
            });
        }
    });
    
    // Setup defenders
    gameState.defenders = config.defenders.map(def => ({
        x: def.x,
        y: canvas.height - 80 - 130,
        width: 120,
        height: 120,
        hp: def.hp,
        color: 'purple',
        speed: def.speed,
        defusing: false,
        defuseStartTime: null,
        targetX: 0,
        targetY: 0,
        image: images.sage,
        onGround: true,
        isJumping: false,
        jumpHeight: 0,
        maxJumpHeight: 120, // Maximum jump height
        jumpSpeed: 5 // Jump speed
    }));
}
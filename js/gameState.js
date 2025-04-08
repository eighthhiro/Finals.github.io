// gameState.js - Game state management
export const gameState = {
    isRunning: false,
    arrows: [],
    defenders: [],
    level: 1,
    arrowsFired: 0,
    enemiesDefeated: 0,
    startTime: null,
    damageTexts: [],
    animationId: null,
    isDragging: false,
    startPoint: null,
    currentPoint: null,
    levelConfigs: {
        1: { 
            defenders: [
                { x: 800, y: 0, hp: 100, speed: 1.5 }
            ],
            bomb: { x: 500, y: 0, defuseTime: 8000 },
            obstacles: [
                { x: 420, y: 0, boxes: 1 } // Number of stacked boxes
            ]
        },
        2: { 
            defenders: [
                { x: 700, y: 0, hp: 100, speed: 1.5 },
                { x: 900, y: 0, hp: 75, speed: 2 }
            ],
            bomb: { x: 500, y: 0, defuseTime: 10000 },
            obstacles: [
                { x: 420, y: 0, boxes: 1 },
                { x: 600, y: 0, boxes: 1 }
            ]
        },
        3: { 
            defenders: [
                { x: 700, y: 0, hp: 100, speed: 1.5 },
                { x: 850, y: 0, hp: 75, speed: 2 },
                { x: 1000, y: 0, hp: 50, speed: 2.5 }
            ],
            bomb: { x: 500, y: 0, defuseTime: 12000 },
            obstacles: [
                { x: 300, y: 0, boxes: 1 },
                { x: 420, y: 0, boxes: 1 },
                { x: 650, y: 0, boxes: 2 } // 2 stacked boxes
            ]
        },
        4: { 
            defenders: [
                { x: 700, y: 0, hp: 120, speed: 1.8 },
                { x: 850, y: 0, hp: 90, speed: 2.2 },
                { x: 1000, y: 0, hp: 70, speed: 2.5 },
                { x: 1100, y: 0, hp: 50, speed: 3 }
            ],
            bomb: { x: 500, y: 0, defuseTime: 15000 },
            obstacles: [
                { x: 300, y: 0, boxes: 1 },
                { x: 450, y: 0, boxes: 2 },
                { x: 650, y: 0, boxes: 2 },
                { x: 850, y: 0, boxes: 1 }
            ]
        },
        5: { 
            defenders: [
                { x: 600, y: 0, hp: 150, speed: 2 },
                { x: 750, y: 0, hp: 120, speed: 2.5 },
                { x: 900, y: 0, hp: 100, speed: 3 },
                { x: 1050, y: 0, hp: 80, speed: 3.5 },
                { x: 1200, y: 0, hp: 60, speed: 4 }
            ],
            bomb: { x: 500, y: 0, defuseTime: 20000 },
            obstacles: [
                { x: 280, y: 0, boxes: 1 },
                { x: 400, y: 0, boxes: 2 },
                { x: 600, y: 0, boxes: 2 },
                { x: 800, y: 0, boxes: 1 },
                { x: 1000, y: 0, boxes: 3 } // 3 stacked boxes
            ]
        }
    }
};

export function resetGameState(level) {
    gameState.isRunning = true;
    gameState.arrows = [];
    gameState.defenders = [];
    gameState.damageTexts = [];
    gameState.level = level;
    gameState.arrowsFired = 0;
    gameState.enemiesDefeated = 0;
    gameState.startTime = Date.now();
    gameState.isDragging = false;
    gameState.startPoint = null;
    gameState.currentPoint = null;
}
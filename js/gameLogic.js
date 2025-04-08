// gameLogic.js - Core game mechanics
import { gameState } from '/gameState.js';
import { ground, sova, bomb, obstacles } from './levelBuilder.js';
import { canvas } from './main.js';

export function createArrow(x, y, vx, vy) {
    const angle = Math.atan2(vy, vx);
    return {
        x, y, vx, vy,
        width: 40,
        height: 20,
        angle,
        stuck: false,
        stuckObject: null,
        timestamp: Date.now(),
        lastX: x,
        lastY: y
    };
}

export function checkDefuserProximity() {
    gameState.defenders.forEach((defender) => {
        const spikeCenterX = bomb.x + bomb.width/2;
        const spikeCenterY = bomb.y + bomb.height/2;
        const defenderCenterX = defender.x + defender.width/2;
        const defenderCenterY = defender.y + defender.height/2;
        
        const dist = Math.hypot(defenderCenterX - spikeCenterX, defenderCenterY - spikeCenterY);
        const minDist = 100;
        
        if (dist < minDist && bomb.planted && !bomb.defused) {
            // Position to left or right of spike
            if (defender.x < bomb.x) {
                defender.targetX = bomb.x - defender.width - 10;
            } else {
                defender.targetX = bomb.x + bomb.width + 10;
            }
            
            // Smooth movement to defuse position
            const moveSpeed = 0.3;
            defender.x += (defender.targetX - defender.x) * moveSpeed;
            defender.y = ground.y - defender.height + 10; // Maintain floating effect
            
            if (!defender.defusing) {
                defender.defuseStartTime = Date.now();
                bomb.defuseStartTime = Date.now();
            }
            defender.defusing = true;
            bomb.defuserNearby = true;
        } else {
            defender.defusing = false;
        }
    });

    // If no defenders are near, reset defuser nearby flag
    if (gameState.defenders.every(d => !d.defusing)) {
        bomb.defuserNearby = false;
    }
}

export function updateDefenders() {
    gameState.defenders.forEach((defender) => {
        // Skip movement updates if defusing
        if (defender.defusing) return;
        
        // Handle jumping mechanics
        if (defender.isJumping) {
            // Ascend phase
            if (defender.jumpHeight < defender.maxJumpHeight) {
                defender.jumpHeight += defender.jumpSpeed;
                defender.y -= defender.jumpSpeed;
            } else {
                // Start descent after reaching max height
                defender.jumpHeight = defender.maxJumpHeight;
                defender.isJumping = false;
            }
        } else if (!defender.onGround) {
            // Descent phase
            defender.y += defender.jumpSpeed;
            
            // Check if landed on an obstacle
            let landedOnObstacle = false;
            for (const obstacle of obstacles) {
                if (defender.x + defender.width > obstacle.x && 
                    defender.x < obstacle.x + obstacle.width &&
                    defender.y + defender.height >= obstacle.y &&
                    defender.y + defender.height <= obstacle.y + 10) { // Small tolerance for landing
                    
                    defender.y = obstacle.y - defender.height;
                    landedOnObstacle = true;
                    break;
                }
            }
            
            // Check if landed on ground
            if (!landedOnObstacle && defender.y + defender.height >= ground.y) {
                defender.y = ground.y - defender.height + 10; // Maintain floating effect
                defender.onGround = true;
                defender.jumpHeight = 0;
            }
        }

        // Move toward bomb
        const dx = bomb.x - defender.x;
        defender.x += (dx > 0 ? 1 : -1) * defender.speed;
        
        // Check for obstacles ahead and jump if needed
        for (const obstacle of obstacles) {
            // Only jump if directly in front of obstacle and on ground
            if (defender.onGround &&
                ((dx > 0 && defender.x + defender.width + 20 > obstacle.x && defender.x < obstacle.x) ||
                 (dx < 0 && defender.x - 20 < obstacle.x + obstacle.width && defender.x > obstacle.x + obstacle.width))) {
                
                defender.isJumping = true;
                defender.onGround = false;
                defender.jumpHeight = 0;
                break;
            }
        }
    });
}

export function applyArrowDamage() {
    for (let a = gameState.arrows.length - 1; a >= 0; a--) {
        const arrow = gameState.arrows[a];
        
        if (arrow.stuck) continue;
        
        for (let d = gameState.defenders.length - 1; d >= 0; d--) {
            const defender = gameState.defenders[d];
            
            if (arrow.x + arrow.width/2 > defender.x && 
                arrow.x - arrow.width/2 < defender.x + defender.width &&
                arrow.y + arrow.height/2 > defender.y && 
                arrow.y - arrow.height/2 < defender.y + defender.height) {
                
                // Check if headshot (upper 1/3 of defender)
                const isHeadshot = arrow.y < defender.y + defender.height/3;
                const damage = isHeadshot ? 100 : 50;
                
                defender.hp -= damage;
                arrow.stuck = true;
                
                // Show damage text
                showDamageText(arrow.x, arrow.y, damage, isHeadshot);
                
                if (defender.hp <= 0) {
                    gameState.defenders.splice(d, 1);
                    gameState.enemiesDefeated++;
                    
                    // Update enemy count in HUD
                    document.getElementById('enemyCount').textContent = gameState.defenders.length;
                    
                    // Check if all defenders are defeated
                    if (gameState.defenders.length === 0) {
                        endLevel(true); // Player wins
                    }
                }
                
                // Remove the arrow that hit
                gameState.arrows.splice(a, 1);
                break;
            }
        }
    }
}

export function updateArrows() {
    const gravity = 0.3;

    for (let i = gameState.arrows.length - 1; i >= 0; i--) {
        const arrow = gameState.arrows[i];
        
        if (!arrow.stuck) {
            arrow.lastX = arrow.x;
            arrow.lastY = arrow.y;
            arrow.x += arrow.vx;
            arrow.y += arrow.vy;
            arrow.vy += gravity;
            arrow.angle = Math.atan2(arrow.vy, arrow.vx);

            // Check collisions with obstacles
            for (const obstacle of obstacles) {
                if (arrow.x + arrow.width/2 > obstacle.x && 
                    arrow.x - arrow.width/2 < obstacle.x + obstacle.width &&
                    arrow.y + arrow.height/2 > obstacle.y && 
                    arrow.y - arrow.height/2 < obstacle.y + obstacle.height) {
                    
                    arrow.stuck = true;
                    arrow.stuckObject = obstacle;
                    break;
                }
            }
            
            // Check collision with ground
            if (arrow.y + arrow.height/2 > ground.y) {
                arrow.y = ground.y - arrow.height/2;
                arrow.stuck = true;
            }
            
            // Check if arrow is out of bounds
            if (arrow.x < 0 || arrow.x > canvas.width || arrow.y > canvas.height) {
                gameState.arrows.splice(i, 1);
                continue;
            }
        }

        // Remove old arrows
        if (Date.now() - arrow.timestamp > 3000) {
            gameState.arrows.splice(i, 1);
        }
    }
}

export function updateBombTimer() {
    if (bomb.planted && !bomb.defused && bomb.defuserNearby) {
        const defuseTimeLeft = bomb.defuseTime - (Date.now() - bomb.defuseStartTime);
        
        // Draw defuse progress bar
        const progressWidth = 100;
        const progressHeight = 10;
        const progressX = bomb.x - progressWidth/2 + bomb.width/2;
        const progressY = bomb.y - 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
        
        const progress = 1 - (defuseTimeLeft / bomb.defuseTime);
        ctx.fillStyle = progress > 0.7 ? 'green' : progress > 0.3 ? 'orange' : 'red';
        ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);
        
        if (defuseTimeLeft <= 0) {
            bomb.defused = true;
            endLevel(false); // Defenders win
        }
    }
}

function showDamageText(x, y, damage, isHeadshot) {
    const text = {
        value: isHeadshot ? `HEADSHOT! ${damage}` : damage.toString(),
        x: x,
        y: y,
        color: isHeadshot ? 'red' : 'white',
        age: 0,
        maxAge: 40
    };

    gameState.damageTexts.push(text);
}

export function updateDamageTexts() {
    for (let i = gameState.damageTexts.length - 1; i >= 0; i--) {
        const text = gameState.damageTexts[i];
        
        text.age++;
        text.y -= 1; // Float upward
        
        // Draw with fade out
        const alpha = 1 - (text.age / text.maxAge);
        ctx.fillStyle = text.color === 'red' ? 
            `rgba(255, 0, 0, ${alpha})` : 
            `rgba(255, 255, 255, ${alpha})`;
        ctx.font = text.color === 'red' ? 'bold 20px Arial' : '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text.value, text.x, text.y);
        
        // Remove old texts
        if (text.age >= text.maxAge) {
            gameState.damageTexts.splice(i, 1);
        }
    }
}

export function endLevel(playerWins) {
    if (!gameState.isRunning) return;

    // Calculate stats and stars
    const timeTaken = (Date.now() - gameState.startTime) / 1000; // in seconds
    const accuracy = gameState.arrowsFired > 0 ? 
        gameState.enemiesDefeated / gameState.arrowsFired : 0;

    let stars = 0;

    if (playerWins) {
        // Criteria for stars:
        // 1 star: Basic completion
        // 2 stars: Good time and some accuracy
        // 3 stars: Excellent time and high accuracy
        stars = 1; // At least 1 star for winning
        
        // Time criteria varies by level
        const goodTimeThreshold = 20 + (gameState.level * 5);
        const excellentTimeThreshold = 10 + (gameState.level * 3);
        
        if (timeTaken < goodTimeThreshold && accuracy > 0.5) {
            stars = 2;
        }
        
        if (timeTaken < excellentTimeThreshold && accuracy > 0.7) {
            stars = 3;
        }
        
        // Report stats to lobby
        window.updateGameStats(gameState.arrowsFired, gameState.enemiesDefeated);
        
        // Report level completion
        window.reportLevelComplete(gameState.level, stars);
    } else {
        // Defender won - show message
        alert("The defenders have defused the spike! Try again.");
        window.updateGameStats(gameState.arrowsFired, gameState.enemiesDefeated);
        window.endGame();
    }

    // Stop the game
    gameState.isRunning = false;
}
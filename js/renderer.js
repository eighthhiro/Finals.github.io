// renderer.js - Drawing and rendering
import { gameState } from './gameState.js';
import { ground, sova, bomb, obstacles } from './levelBuilder.js';
import { canvas, ctx } from './main.js';
import { images } from './assetLoader.js';
import { 
    checkDefuserProximity, 
    updateDefenders, 
    updateArrows, 
    updateBombTimer, 
    applyArrowDamage, 
    updateDamageTexts 
} from './gameLogic.js';

export function drawRect(obj) {
    if (obj.image && obj.image.complete) {
        ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
    } else {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
}

export function drawHealthBar(defender) {
    ctx.fillStyle = 'red';
    ctx.fillRect(defender.x, defender.y - 10, defender.width, 5);
    ctx.fillStyle = 'green';
    ctx.fillRect(defender.x, defender.y - 10, (defender.hp / 100) * defender.width, 5);
}

export function drawArrow(arrow) {
    if (images.arrow && images.arrow.complete) {
        ctx.save();
        ctx.translate(arrow.x, arrow.y);
        ctx.rotate(arrow.angle);
        ctx.drawImage(images.arrow, -arrow.width/2, -arrow.height/2, arrow.width, arrow.height);
        ctx.restore();
    } else {
        ctx.fillStyle = '#f9fafb';
        ctx.beginPath();
        ctx.moveTo(arrow.x, arrow.y);
        ctx.lineTo(arrow.x - arrow.width, arrow.y - arrow.height/2);
        ctx.lineTo(arrow.x - arrow.width, arrow.y + arrow.height/2);
        ctx.closePath();
        ctx.fill();
    }
}

export function drawTrajectory(startX, startY, velocityX, velocityY) {
    const gravity = 0.3;
    let x = startX;
    let y = startY;
    let vx = velocityX;
    let vy = velocityY;

    const points = [];
    const trajectoryPoints = 30;
    const trajectoryDotRadius = 3;

    for (let i = 0; i < trajectoryPoints; i++) {
        x += vx;
        y += vy;
        vy += gravity;
        
        // Check for collisions with obstacles
        let collided = false;
        for (const obstacle of obstacles) {
            if (x > obstacle.x && x < obstacle.x + obstacle.width && 
                y > obstacle.y && y < obstacle.y + obstacle.height) {
                collided = true;
                break;
            }
        }
        
        // Check for collision with ground
        if (y > ground.y) {
            collided = true;
        }
        
        points.push({x, y});
        if (collided) break;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    points.forEach((point, index) => {
        if (index % 2 === 0) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, trajectoryDotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

export function drawScene() {
    if (!gameState.isRunning) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (images.background && images.background.complete) {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }

    // Calculate and draw trajectory if player is aiming
    if (gameState.isDragging && gameState.startPoint && gameState.currentPoint) {
        const dx = gameState.startPoint.x - gameState.currentPoint.x;
        const dy = gameState.startPoint.y - gameState.currentPoint.y;
        drawTrajectory(
            sova.x + sova.width, 
            sova.y + sova.height / 2, 
            dx * 0.2, 
            dy * 0.2
        );
        
        // Draw power meter
        const distance = Math.sqrt(dx * dx + dy * dy);
        const strength = Math.min(distance / 200, 1);
        const meterX = sova.x + sova.width + 10;
        const meterY = sova.y + sova.height / 2;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(meterX, meterY - 50, 10, 100);
        ctx.fillStyle = strength > 0.8 ? 'red' : strength > 0.5 ? 'orange' : 'green';
        ctx.fillRect(meterX, meterY + 50, 10, -100 * strength);
    }

    // Draw game objects
    drawRect(ground);

    // Draw obstacles
    obstacles.forEach(obstacle => {
        drawRect(obstacle);
    });

    // Draw Sova character
    drawRect(sova);

    // Draw spike/bomb
    if (bomb.planted) {
        drawRect(bomb);
    }

    // Draw defenders
    gameState.defenders.forEach(defender => {
        drawRect(defender);
        drawHealthBar(defender);
    });

    // Draw arrows
    gameState.arrows.forEach(arrow => {
        drawArrow(arrow);
    });

    // Update game logic
    updateArrows();
    updateDefenders();
    checkDefuserProximity();
    updateBombTimer();
    applyArrowDamage();
    updateDamageTexts();

    // Continue animation loop
    gameState.animationId = requestAnimationFrame(drawScene);
}
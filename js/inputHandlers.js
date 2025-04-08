// inputHandlers.js - Mouse and touch input handling
import { gameState } from './gameState.js';
import { canvas, ctx } from './main.js';
import { sova } from './levelBuilder.js';
import { createArrow } from './gameLogic.js';
import { resizeCanvas } from './utils.js';

export function setupEventListeners() {
    window.addEventListener('resize', resizeCanvas);
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
}

export function removeEventListeners() {
    window.removeEventListener('resize', resizeCanvas);
    
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX > sova.x && mouseX < sova.x + sova.width &&
        mouseY > sova.y && mouseY < sova.y + sova.height) {
        gameState.isDragging = true;
        gameState.startPoint = { x: mouseX, y: mouseY };
    }
}

function handleMouseMove(e) {
    if (gameState.isDragging) {
        const rect = canvas.getBoundingClientRect();
        gameState.currentPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
}

function handleMouseUp() {
    if (gameState.isDragging && gameState.startPoint && gameState.currentPoint) {
        const dx = gameState.startPoint.x - gameState.currentPoint.x;
        const dy = gameState.startPoint.y - gameState.currentPoint.y;
        const velocity = { x: dx * 0.2, y: dy * 0.2 };
        const arrow = createArrow(sova.x + sova.width - 20, sova.y + sova.height / 2, velocity.x, velocity.y);
        gameState.arrows.push(arrow);
        gameState.arrowsFired++;
    }
    gameState.isDragging = false;
    gameState.startPoint = null;
    gameState.currentPoint = null;
}

function handleTouchStart(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    if (touchX > sova.x && touchX < sova.x + sova.width &&
        touchY > sova.y && touchY < sova.y + sova.height) {
        gameState.isDragging = true;
        gameState.startPoint = { x: touchX, y: touchY };
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (gameState.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        gameState.currentPoint = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
}

function handleTouchEnd() {
    if (gameState.isDragging && gameState.startPoint && gameState.currentPoint) {
        const dx = gameState.startPoint.x - gameState.currentPoint.x;
        const dy = gameState.startPoint.y - gameState.currentPoint.y;
        const velocity = { x: dx * 0.2, y: dy * 0.2 };
        const arrow = createArrow(sova.x + sova.width - 20, sova.y + sova.height / 2, velocity.x, velocity.y);
        gameState.arrows.push(arrow);
        gameState.arrowsFired++;
    }
    gameState.isDragging = false;
    gameState.startPoint = null;
    gameState.currentPoint = null;
}
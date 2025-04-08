// Game state and configuration
let gameState = {
    isRunning: false,
    arrows: [],
    defenders: [],
    level: 1,
    arrowsFired: 0,
    enemiesDefeated: 0,
    startTime: null,
    damageTexts: [], // Initialize damageTexts array here
    defenderSpawnTimes: [],
    lastSpawnTime: 0,
    spawnDelay: 1000, // 1 second between spawns
    levelConfigs: {
        // Level configs remain unchanged
        1: { 
            defenders: [
                { x: 900, y: 0, hp: 100, speed: 1.5 }
            ],
            bomb: { x: 500, y: 0, defuseTime: 8000 },
            obstacles: [
                { x: 420, width: 60, height: 60, type: 'box' }
            ]
        },
        2: { 
            defenders: [
                { x: 1200, hp: 100, speed: 1.5 },
                { x: 1200, hp: 100, speed: 1.5 }
            ],
            bomb: { x: 700, y: 0, defuseTime: 8000 },
            obstacles: [
                { x: 520, width: 60, height: 60, type: 'box' },
                { x: 520, width: 60, height: 60, type: 'box' }
            ]
        },
        3: { 
            defenders: [
                { x: 1200, hp: 150, speed: 1.5 },
                { x: 1200, hp: 150, speed: 1.5 },
                { x: 1200, hp: 150, speed: 1.5 }
            ],
            bomb: { x: 700, y: 0, defuseTime: 8000 },
            obstacles: [
                { x: 450, width: 60, height: 60, type: 'box' },
                { x: 550, width: 60, height: 60, type: 'box' },
                { x: 550, width: 60, height: 60, type: 'box' },
            ]
        },
        4: { 
            defenders: [
                { x: 1200, y: 0, hp: 100, speed: 1.5 },
                { x: 1200, y: 0, hp: 100, speed: 1.5 },
                { x: 1200, y: 0, hp: 100, speed: 1.5 },
                { x: 1200, y: 0, hp: 100, speed: 1.5 }
            ],
            bomb: { x: 600, y: 0, defuseTime: 8000 },
            obstacles: [
                { x: 450, width: 60, height: 60, type: 'box' },
                { x: 550, width: 60, height: 60, type: 'box' },
                { x: 550, width: 60, height: 60, type: 'box' },
                { x: 700, width: 60, height: 60, type: 'box' },
                { x: 800, width: 60, height: 60, type: 'box' }
            ]
        },
        5: { 
            defenders: [
                { x: 1200, y: 0, hp: 100, speed: 1.5 },
                { x: 1200, y: 0, hp: 100, speed: 1.5 },
                { x: 1200, y: 0, hp: 100, speed: 1.5 },
                { x: 1200, y: 0, hp: 100, speed: 1.5 },
                { x: 1200, y: 0, hp: 100, speed: 1.5 }
            ],
            bomb: { x: 500, y: 0, defuseTime: 8000 },
            obstacles: [
                { x: 450, width: 60, height: 60, type: 'box' },
                { x: 550, width: 60, height: 60, type: 'box' },
                { x: 550, width: 60, height: 60, type: 'box' }
            ]
        }
    }
};

// Game elements
let canvas, ctx;
let ground, sova, bomb, obstacles = [];
let isDragging = false;
let startPoint = null;
let currentPoint = null;
let animationId = null;
let images = {};

// Load all images
function loadImages() {
    const imageList = {
        background: "assets/bg.png",
        sova: "assets/Sova-Standing.png",
        arrow: "assets/Arrow.png",
        spike: "assets/Spike.png",
        sage: "assets/Sage.png",
        box: "assets/Box.png"
    };
    
    let loadedCount = 0;
    const totalImages = Object.keys(imageList).length;
    
    return new Promise((resolve) => {
        for (const [name, src] of Object.entries(imageList)) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            images[name] = img;
        }
    });
}

// Initialize game
window.initGame = async function(level) {
    // Don't initialize if already running
    if (gameState.isRunning) return;
    
    // Set up canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Resize canvas
    resizeCanvas();
    
    // Load images if not already loaded
    if (Object.keys(images).length === 0) {
        await loadImages();
    }
    
    // Setup game state
    gameState.isRunning = true;
    gameState.arrows = [];
    gameState.damageTexts = [];
    gameState.level = level;
    gameState.arrowsFired = 0;
    gameState.enemiesDefeated = 0;
    gameState.startTime = Date.now();
    
    // Initialize game elements
    initializeLevel(level);
    
    // Set up event listeners
    setupEventListeners();
    
    // Start game loop
    drawScene();
    
    // Update enemy count in HUD
    document.getElementById('enemyCount').textContent = gameState.defenders.length;
};

// Stop game
window.stopGame = function() {
    if (!gameState.isRunning) return;
    
    gameState.isRunning = false;
    
    // Remove event listeners
    removeEventListeners();
    
    // Stop animation loop
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
};

// Initialize level based on configuration
function initializeLevel(level) {
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
    
    obstacles = [];
    let previousBoxes = []; // Track boxes at each x position

    config.obstacles.forEach(obstacle => {
        // Find all boxes at this x position that we've already placed
        const boxesAtThisX = previousBoxes.filter(b => b.x === obstacle.x);
        
        // Calculate total height of boxes already at this x position
        const totalHeight = boxesAtThisX.reduce((sum, box) => sum + box.height, 0);
        
        const newBox = {
            x: obstacle.x,
            y: canvas.height - 80 - obstacle.height - totalHeight,
            width: obstacle.width,
            height: obstacle.height,
            color: '#8B4513',
            type: obstacle.type,
            image: images.box
        };
        
        obstacles.push(newBox);
        previousBoxes.push(newBox); // Add to our tracking list
    });
    
    // Setup defenders
    gameState.defenders = config.defenders.map(def => ({
        x: def.x,
        y: canvas.height - 80 - 130,
        width: 92,
        height: 95,
        hp: def.hp,
        color: 'purple',
        speed: def.speed,
        defusing: false,
        defuseStartTime: null,
        targetX: 0,
        targetY: 0,
        image: images.sage,
        onGround: true
    }));
    gameState.defenders = [];
    gameState.defenderSpawnTimes = config.defenders.map((def, index) => ({
        config: def,
        spawnTime: index * gameState.spawnDelay // Staggered spawning
    }));
    gameState.lastSpawnTime = Date.now();
}

// Resize handler
function resizeCanvas() {
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
        // Recalculate box stacking on resize
        let previousBoxes = [];
        obstacles.forEach(obstacle => {
            const boxesAtThisX = previousBoxes.filter(b => b.x === obstacle.x);
            const totalHeight = boxesAtThisX.reduce((sum, box) => sum + box.height, 0);
            obstacle.y = canvas.height - 80 - obstacle.height - totalHeight;
            previousBoxes.push(obstacle);
        });
    }
    
    if (gameState.defenders.length > 0) {
        gameState.defenders.forEach(defender => {
            defender.y = canvas.height - 80 - 120; //
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    window.addEventListener('resize', resizeCanvas);
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
}

// Remove event listeners
function removeEventListeners() {
    window.removeEventListener('resize', resizeCanvas);
    
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
}

// Input handlers
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX > sova.x && mouseX < sova.x + sova.width &&
        mouseY > sova.y && mouseY < sova.y + sova.height) {
        isDragging = true;
        startPoint = { x: mouseX, y: mouseY };
    }
}

function handleMouseMove(e) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        currentPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
}

function handleMouseUp() {
    if (isDragging && startPoint && currentPoint) {
        const dx = startPoint.x - currentPoint.x;
        const dy = startPoint.y - currentPoint.y;
        const velocity = { x: dx * 0.2, y: dy * 0.2 };
        const arrow = createArrow(sova.x + sova.width - 20, sova.y + sova.height / 2, velocity.x, velocity.y);
        gameState.arrows.push(arrow);
        gameState.arrowsFired++;
    }
    isDragging = false;
    startPoint = null;
    currentPoint = null;
}

// Touch event handlers for mobile support
function handleTouchStart(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    if (touchX > sova.x && touchX < sova.x + sova.width &&
        touchY > sova.y && touchY < sova.y + sova.height) {
        isDragging = true;
        startPoint = { x: touchX, y: touchY };
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        currentPoint = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
}

function handleTouchEnd() {
    if (isDragging && startPoint && currentPoint) {
        const dx = startPoint.x - currentPoint.x;
        const dy = startPoint.y - currentPoint.y;
        const velocity = { x: dx * 0.2, y: dy * 0.2 };
        const arrow = createArrow(sova.x + sova.width - 20, sova.y + sova.height / 2, velocity.x, velocity.y);
        gameState.arrows.push(arrow);
        gameState.arrowsFired++;
    }
    isDragging = false;
    startPoint = null;
    currentPoint = null;
}

// Arrow creation
function createArrow(x, y, vx, vy) {
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

// Drawing functions
function drawRect(obj) {
    if (obj.image && obj.image.complete) {
        ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
    } else {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
}

function drawHealthBar(defender) {
    // Base red bar (full width)
    ctx.fillStyle = 'red';
    ctx.fillRect(defender.x, defender.y - 10, defender.width, 5);

    // Green health portion (capped to 100%)
    const hpRatio = defender.hp / 100;
    const greenWidth = Math.min(hpRatio, 1) * defender.width;
    ctx.fillStyle = 'green';
    ctx.fillRect(defender.x, defender.y - 10, greenWidth, 5);

    // Overheal portion (above the red bar)
    if (hpRatio > 1) {
        const grayWidth = (hpRatio - 1) * defender.width;
        ctx.fillStyle = 'gray';
        ctx.fillRect(defender.x, defender.y - 16, grayWidth, 5);
    }
}



function drawArrow(arrow) {
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

function drawTrajectory(startX, startY, velocityX, velocityY) {
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

// Game logic functions
function checkDefuserProximity() {
    let isSomeoneDefusing = false;
    
    // First pass to check if anyone is already defusing
    gameState.defenders.forEach(defender => {
        if (defender.defusing) {
            isSomeoneDefusing = true;
        }
    });
    
    // Second pass to handle proximity and defusing logic
    gameState.defenders.forEach((defender) => {
        const spikeCenterX = bomb.x + bomb.width/2;
        const spikeCenterY = bomb.y + bomb.height/2;
        const defenderCenterX = defender.x + defender.width/2;
        const defenderCenterY = defender.y + defender.height/2;
        
        const dist = Math.hypot(defenderCenterX - spikeCenterX, defenderCenterY - spikeCenterY);
        const minDist = 100;
        
        if (dist < minDist && bomb.planted && !bomb.defused) {
            // Only allow defusing if no one else is defusing
            if (!isSomeoneDefusing) {
                // Position to left or right of spike
                if (defender.x < bomb.x) {
                    defender.targetX = bomb.x - defender.width - 10;
                } else {
                    defender.targetX = bomb.x + bomb.width + 10;
                }
                
                // Smooth movement to defuse position
                const moveSpeed = 0.3;
                defender.x += (defender.targetX - defender.x) * moveSpeed;
                defender.y = ground.y - defender.height + 10;
                
                if (!defender.defusing) {
                    defender.defuseStartTime = Date.now();
                    bomb.defuseStartTime = Date.now();
                }
                defender.defusing = true;
                bomb.defuserNearby = true;
                isSomeoneDefusing = true; // Mark that someone is now defusing
            }
        } else {
            defender.defusing = false;
        }
    });

    // If no defenders are near, reset defuser nearby flag
    if (gameState.defenders.every(d => !d.defusing)) {
        bomb.defuserNearby = false;
    }
}

function updateBombTimer() {
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

function applyArrowDamage() {
    let defuserDied = false;
    
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
                const isHeadshot = arrow.y < defender.y + defender.height/4;
                const damage = isHeadshot ? 100 : 50;
                
                defender.hp -= damage;
                arrow.stuck = true;
                
                // Show damage text
                showDamageText(arrow.x, arrow.y, damage, isHeadshot);
                
                if (defender.hp <= 0) {
                    // Check if this was the defusing defender
                    if (defender.defusing) {
                        defuserDied = true;
                        bomb.defuserNearby = false;
                    }
                    
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
    
    // If the defusing defender died, allow another defender to start defusing
    if (defuserDied) {
        checkDefuserProximity();
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

    // Add to damage text array (initialized in gameState)
    gameState.damageTexts.push(text);
}

function updateDamageTexts() {
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

// Replace the updateDefenders function with this simplified version:
function updateDefenders() {
    // Check if anyone is currently defusing
    const defuser = gameState.defenders.find(d => d.defusing);
    
    gameState.defenders.forEach((defender, index) => {
        // Ground check
        defender.y = ground.y - defender.height;
        defender.onGround = true;

        if (defender.defusing) {
            // This defender is defusing - they're already positioned correctly
            return;
        }
        
        if (defuser) {
            // There's a defuser - position other defenders in a line near the spike
            const lineOffset = (index % 2 === 0 ? 1 : -1) * Math.ceil(index / 2) * (defender.width + 10);
            
            // Target position is to the side of the spike, forming a line
            defender.targetX = bomb.x + lineOffset;
            
            // Smooth movement to line position
            const moveSpeed = 0.2;
            defender.x += (defender.targetX - defender.x) * moveSpeed;
            defender.y = ground.y - defender.height + 10;
        } else {
            // No one is defusing - move straight toward bomb
            const dx = bomb.x - defender.x;
            const moveDirection = dx > 0 ? 1 : -1;
            
            // Simple movement without obstacle checks
            defender.x += moveDirection * defender.speed;
        }
    });
}

function spawnDefenders() {
    const now = Date.now();
    const timeSinceLastSpawn = now - gameState.lastSpawnTime;
    
    for (let i = gameState.defenderSpawnTimes.length - 1; i >= 0; i--) {
        const spawnInfo = gameState.defenderSpawnTimes[i];
        
        if (spawnInfo.spawnTime <= timeSinceLastSpawn && !spawnInfo.spawned) {
            const def = spawnInfo.config;
            gameState.defenders.push({
                x: def.x,
                y: canvas.height - 80 - 120,
                width: 92,
                height: 95,
                hp: def.hp,
                color: 'purple',
                speed: def.speed,
                defusing: false,
                defuseStartTime: null,
                targetX: 0,
                targetY: 0,
                image: images.sage,
                onGround: true
            });
            spawnInfo.spawned = true;
            
            // Update enemy count in HUD
            document.getElementById('enemyCount').textContent = gameState.defenders.length;
        }
    }
}

function updateArrows() {
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

function endLevel(playerWins) {
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

// Main game loop
function drawScene() {
    if (!gameState.isRunning) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (images.background && images.background.complete) {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }

    // Draw trajectory if aiming (unchanged)
    if (isDragging && startPoint && currentPoint) {
        const dx = startPoint.x - currentPoint.x;
        const dy = startPoint.y - currentPoint.y;
        drawTrajectory(
            sova.x + sova.width, 
            sova.y + sova.height / 2, 
            dx * 0.2, 
            dy * 0.2
        );
        
        // Draw power meter (unchanged)
        const distance = Math.sqrt(dx * dx + dy * dy);
        const strength = Math.min(distance / 200, 1);
        const meterX = sova.x + sova.width + 10;
        const meterY = sova.y + sova.height / 2;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(meterX, meterY - 50, 10, 100);
        ctx.fillStyle = strength > 0.8 ? 'red' : strength > 0.5 ? 'orange' : 'green';
        ctx.fillRect(meterX, meterY + 50, 10, -100 * strength);
    }

    // Draw ground
    drawRect(ground);

    // Draw obstacles
    obstacles.forEach(obstacle => {
        drawRect(obstacle);
    });

    // Draw defenders
    gameState.defenders.forEach(defender => {
        drawRect(defender);
        drawHealthBar(defender);
    });

    // Draw Sova character
    drawRect(sova);
    spawnDefenders();

    // Draw spike/bomb
    if (bomb.planted) {
        drawRect(bomb);
    }

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
    animationId = requestAnimationFrame(drawScene);
}
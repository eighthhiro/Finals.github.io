const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load images
const backgroundImage = new Image();
backgroundImage.src = "assets/bg.png";
const sovaImage = new Image();
sovaImage.src = "assets/Sova-Standing.png";
const arrowImage = new Image();
arrowImage.src = "assets/Arrow.png";
const spikeImage = new Image();
spikeImage.src = "assets/Spike.png";
const sageImage = new Image();
sageImage.src = "assets/Sage.png";
const boxImage = new Image();
boxImage.src = "assets/Box.png";

// Game elements
const ground = {
  x: 0,
  y: canvas.height - 80,
  width: canvas.width,
  height: 80,
  color: 'rgba(46, 46, 46)' // Semi-transparent
};

// Box obstacle on ground
const boxObstacle = {
  x: 420,
  y: canvas.height - 80 - 52, // On ground
  width: 52,
  height: 52,
  color: '#8B4513',
  image: boxImage
};

// Characters
const sova = {
  x: 100,
  y: canvas.height - 190,
  width: 120,
  height: 120,
  color: '#00f0ff',
  image: sovaImage
};

// Spike (bomb)
const bomb = {
  x: canvas.width / 2,
  y: canvas.height - 120, // On ground
  width: 40,
  height: 40,
  planted: true,
  defused: false,
  defuseTime: 8000,
  defuserNearby: false,
  image: spikeImage
};

// Sage defender
const defenders = [
  { 
    x: canvas.width - 200, 
    y: canvas.height - 80 - 120, // On ground
    width: 120,
    height: 120,
    hp: 100, 
    color: 'purple', 
    speed: 1.5, 
    defusing: false, 
    defuseStartTime: null,
    targetX: 0,
    targetY: 0,
    image: sageImage,
    onGround: true
  }
];

// Arrow system
const arrows = [];
const gravity = 0.3;

// Trajectory variables
let isDragging = false;
let startPoint = null;
let currentPoint = null;
const trajectoryPoints = 30;
const trajectoryDotRadius = 3;

// Resize handler
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ground.y = canvas.height - 80;
  ground.width = canvas.width;

  sova.y = canvas.height - 190;
  bomb.y = canvas.height - 120;
  boxObstacle.y = canvas.height - 80 - boxObstacle.height;
  
  defenders.forEach(defender => {
    defender.y = ground.y - defender.height;
  });
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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
  ctx.fillStyle = 'red';
  ctx.fillRect(defender.x, defender.y - 10, defender.width, 5);
  ctx.fillStyle = 'green';
  ctx.fillRect(defender.x, defender.y - 10, (defender.hp / 100) * defender.width, 5);
}

function createArrow(x, y, vx, vy) {
  const angle = Math.atan2(vy, vx);
  return {
    x, y, vx, vy,
    width: 35,
    height: 20,
    angle,
    stuck: false,
    stuckObject: null,
    timestamp: Date.now(),
    lastX: x,
    lastY: y
  };
}

function drawArrow(arrow) {
  if (arrowImage.complete) {
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.angle);
    ctx.drawImage(arrowImage, -arrow.width/2, -arrow.height/2, arrow.width, arrow.height);
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
  let x = startX;
  let y = startY;
  let vx = velocityX;
  let vy = velocityY;
  
  const points = [];
  for (let i = 0; i < trajectoryPoints; i++) {
    x += vx;
    y += vy;
    vy += gravity;
    
    // Check for collisions
    const collided = (x > boxObstacle.x && x < boxObstacle.x + boxObstacle.width && 
                     y > boxObstacle.y && y < boxObstacle.y + boxObstacle.height) ||
                    (y > ground.y);
    
    if (collided) {
      points.push({x, y});
      break;
    }
    
    points.push({x, y});
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

// Input handlers
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (mouseX > sova.x && mouseX < sova.x + sova.width &&
      mouseY > sova.y && mouseY < sova.y + sova.height) {
    isDragging = true;
    startPoint = { x: mouseX, y: mouseY };
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    currentPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
});

canvas.addEventListener('mouseup', () => {
  if (isDragging && startPoint && currentPoint) {
    const dx = startPoint.x - currentPoint.x;
    const dy = startPoint.y - currentPoint.y;
    const velocity = { x: dx * 0.2, y: dy * 0.2 };
    const arrow = createArrow(sova.x + sova.width - 20, sova.y + sova.height / 2, velocity.x, velocity.y);
    arrows.push(arrow);
  }
  isDragging = false;
  startPoint = null;
  currentPoint = null;
});

// Game logic functions
function checkDefuserProximity() {
  defenders.forEach((defender) => {
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
      defender.y = ground.y - defender.height;
      
      if (!defender.defusing) {
        defender.defuseStartTime = Date.now();
      }
      defender.defusing = true;
      bomb.defuserNearby = true;
    } else {
      defender.defusing = false;
      bomb.defuserNearby = false;
    }
  });
}

function updateBombTimer() {
  if (bomb.planted && !bomb.defused && bomb.defuserNearby) {
    const defuseTimeLeft = bomb.defuseTime - (Date.now() - defenders[0].defuseStartTime);
    if (defuseTimeLeft <= 0) {
      bomb.defused = true;
      alert("The bomb has been defused!");
      bomb.planted = false;
    }
  }
}

function applyArrowDamage() {
  arrows.forEach((arrow, arrowIndex) => {
    defenders.forEach((defender) => {
      if (!arrow.stuck && 
          arrow.x + arrow.width/2 > defender.x && 
          arrow.x - arrow.width/2 < defender.x + defender.width &&
          arrow.y + arrow.height/2 > defender.y && 
          arrow.y - arrow.height/2 < defender.y + defender.height) {
        
        defender.hp -= 50;
        arrow.stuck = true;
        if (defender.hp <= 0) {
          defenders.splice(defenders.indexOf(defender), 1);
        }
        arrows.splice(arrowIndex, 1);
      }
    });
  });
}

function updateDefenders() {
  defenders.forEach((defender) => {
    // Ground check
    if (defender.y + defender.height < ground.y) {
      defender.y += 5; // Gravity
      defender.onGround = false;
    } else {
      defender.y = ground.y - defender.height;
      defender.onGround = true;
    }

    if (!bomb.defuserNearby) {
      // Move toward bomb
      const dx = bomb.x - defender.x;
      defender.x += (dx > 0 ? 1 : -1) * defender.speed;
      
      // Jump over box if needed
      if (defender.onGround && 
          defender.x + defender.width > boxObstacle.x && 
          defender.x < boxObstacle.x + boxObstacle.width) {
        defender.y -= 30;
        defender.onGround = false;
      }
    }
  });
}

// Main game loop
function drawScene() {
  // Clear and draw background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundImage.complete) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }

  // Draw trajectory if dragging
  if (isDragging && startPoint && currentPoint) {
    const dx = startPoint.x - currentPoint.x;
    const dy = startPoint.y - currentPoint.y;
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
  drawRect(boxObstacle);
  drawRect(sova);
  
  if (bomb.planted) {
    drawRect(bomb);
  }

  defenders.forEach(defender => {
    drawRect(defender);
    drawHealthBar(defender);
  });

  // Update and draw arrows
  arrows.forEach((arrow, index) => {
    if (!arrow.stuck) {
      arrow.lastX = arrow.x;
      arrow.lastY = arrow.y;
      arrow.x += arrow.vx;
      arrow.y += arrow.vy;
      arrow.vy += gravity;
      arrow.angle = Math.atan2(arrow.vy, arrow.vx);

      // Check collisions
      if (arrow.x + arrow.width/2 > boxObstacle.x && 
          arrow.x - arrow.width/2 < boxObstacle.x + boxObstacle.width &&
          arrow.y + arrow.height/2 > boxObstacle.y && 
          arrow.y - arrow.height/2 < boxObstacle.y + boxObstacle.height) {
        
        arrow.stuck = true;
        arrow.stuckObject = boxObstacle;
      } else if (arrow.y + arrow.height/2 > ground.y) {
        arrow.y = ground.y - arrow.height/2;
        arrow.stuck = true;
      }
    } else if (arrow.stuckObject) {
      // Move with stuck object (like moving platforms could be added later)
      arrow.x += arrow.stuckObject.x - (arrow.stuckObject.lastX || arrow.stuckObject.x);
      arrow.y += arrow.stuckObject.y - (arrow.stuckObject.lastY || arrow.stuckObject.y);
    }

    drawArrow(arrow);

    // Remove old arrows
    if (Date.now() - arrow.timestamp > 3000) {
      arrows.splice(index, 1);
    }
  });

  // Update game state
  checkDefuserProximity();
  updateBombTimer();
  applyArrowDamage();
  updateDefenders();

  requestAnimationFrame(drawScene);
}

// Start the game
drawScene();
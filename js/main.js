// main.js - Main game initialization and loop
// Export canvas and ctx so other modules can access them
export let canvas, ctx;

// Initialize game
window.initGame = async function(level) {
    console.log("Initializing game for level:", level);
    
    // Don't initialize if already running
    if (window.gameState && window.gameState.isRunning) return;
    
    // Set up canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Import modules dynamically to avoid path issues
    try {
        const { gameState, resetGameState } = await import('./gameState.js');
        const { loadImages } = await import('./assetLoader.js');
        const { setupEventListeners } = await import('./inputHandlers.js');
        const { initializeLevel } = await import('./levelBuilder.js');
        const { drawScene } = await import('./renderer.js');
        const { resizeCanvas } = await import('./utils.js');
        
        // Store gameState globally for access
        window.gameState = gameState;
        
        // Resize canvas
        resizeCanvas();
        
        // Load images
        await loadImages();
        
        // Reset game state for this level
        resetGameState(level);
        
        // Initialize level
        initializeLevel(level);
        
        // Set up event listeners
        setupEventListeners();
        
        // Update enemy count in HUD
        document.getElementById('enemyCount').textContent = gameState.defenders.length;
        
        // Start game loop
        drawScene();
        
        console.log("Game initialized successfully!");
    } catch (error) {
        console.error("Error initializing game:", error);
    }
};

// Stop game
window.stopGame = function() {
    const gameState = window.gameState;
    if (!gameState || !gameState.isRunning) return;
    
    import('./inputHandlers.js').then(({ removeEventListeners }) => {
        // Remove event listeners
        removeEventListeners();
        
        // Stop animation loop
        if (gameState.animationId) {
            cancelAnimationFrame(gameState.animationId);
            gameState.animationId = null;
        }
        
        gameState.isRunning = false;
        console.log("Game stopped");
    });
};
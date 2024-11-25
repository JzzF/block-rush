class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.gameState = new GameState();
        this.renderer = new Renderer(this.canvas);
        this.audioManager = new AudioManager();
        this.animationManager = new AnimationManager();

        // Game state
        this.selectedBlockIndex = -1;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastFrameTime = 0;
        this.isRunning = false;
        this.isDragging = false;

        // Bind methods
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.update = this.update.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleBlockSelect = this.handleBlockSelect.bind(this);

        // Event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        document.getElementById('start-button').addEventListener('click', this.start);
        document.getElementById('restart-button').addEventListener('click', this.start);
        document.getElementById('share-button').addEventListener('click', () => this.shareScore());

        // Prevent default touch behavior on game canvas
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        // Initialize Telegram WebApp
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
            
            // Prevent Telegram WebApp from closing on swipe
            window.Telegram.WebApp.onEvent('viewportChanged', () => {
                window.Telegram.WebApp.expand();
            });
        }

        // Set up the renderer's block selection callback
        this.renderer.onBlockSelect = this.handleBlockSelect;

        // Show start screen
        this.showScreen('start-screen');
    }

    start() {
        this.gameState.reset();
        this.audioManager.startBGM();
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.showScreen('game-screen');
        this.updateAvailableBlocks();
        requestAnimationFrame(this.update);
    }

    stop() {
        this.isRunning = false;
        this.audioManager.stopBGM();
        document.getElementById('final-score').textContent = `Score: ${this.gameState.score}`;
        this.showScreen('game-over-screen');
    }

    update(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Update game state
        this.gameState.timeRemaining -= deltaTime / 1000;
        
        // Check phase change
        if (this.gameState.updatePhase()) {
            this.audioManager.playPhaseChangeSound();
            this.audioManager.updateBGMSpeed(this.gameState.currentPhase);
            this.animationManager.addPhaseChangeAnimation();
            document.body.className = `phase-${this.gameState.currentPhase}`;
        }

        // Update UI
        this.updateUI();

        // Clear canvas
        this.renderer.clear();

        // Draw game elements
        this.renderer.drawGrid();
        this.renderer.drawBlocks(this.gameState.grid);

        // Draw preview if a block is selected
        if (this.selectedBlockIndex !== -1) {
            const selectedBlock = CONFIG.BLOCKS.TYPES[this.selectedBlockIndex];
            this.renderer.drawPreview(selectedBlock, this.mouseX, this.mouseY);
        }

        // Update and draw animations
        this.animationManager.update(currentTime);

        // Check game over
        if (this.gameState.isGameOverCondition()) {
            this.stop();
            return;
        }

        requestAnimationFrame(this.update);
    }

    updateUI() {
        // Update displays
        document.getElementById('score-display').textContent = `Score: ${this.gameState.score}`;
        document.getElementById('time-display').textContent = `Time: ${Math.ceil(this.gameState.timeRemaining)}s`;
        document.getElementById('multiplier-display').textContent = 
            `×${CONFIG.GAME.PHASES[this.gameState.currentPhase].MULTIPLIER.toFixed(1)}`;

        // Update timer urgency
        const timeDisplay = document.getElementById('time-display');
        if (this.gameState.timeRemaining <= 10) {
            timeDisplay.classList.add('urgent-timer');
        } else {
            timeDisplay.classList.remove('urgent-timer');
        }
    }

    handleMouseMove(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (!event.touches[0]) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.touches[0].clientX - rect.left;
        this.mouseY = event.touches[0].clientY - rect.top;

        if (this.isDragging && this.selectedBlockIndex !== -1) {
            // Update preview position
            requestAnimationFrame(this.update);
        }
    }

    handleTouchStart(event) {
        event.preventDefault();
        this.isDragging = true;
        
        const rect = this.canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Check if touch is in block selection area
        const blockSize = this.renderer.blockSize;
        const gridSize = CONFIG.GRID.SIZE;
        const blockOptionsY = (gridSize + 1) * blockSize;
        
        if (y >= blockOptionsY) {
            const blockIndex = Math.floor(x / blockSize);
            if (blockIndex >= 0 && blockIndex < CONFIG.BLOCKS.TYPES.length) {
                this.handleBlockSelect(blockIndex);
            }
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        if (this.selectedBlockIndex === -1) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = this.mouseX;
        const y = this.mouseY;
        const gridX = Math.floor(x / this.renderer.blockSize);
        const gridY = Math.floor(y / this.renderer.blockSize);

        const selectedBlock = CONFIG.BLOCKS.TYPES[this.selectedBlockIndex];
        if (this.gameState.placeBlock(selectedBlock, gridX, gridY)) {
            this.audioManager.playPlaceSound();
            this.animationManager.addBlockPlaceAnimation(gridX, gridY, CONFIG.COLORS.BLOCKS[1]);
            this.updateAvailableBlocks();
            this.selectedBlockIndex = -1;
        }
        
        this.isDragging = false;
    }

    handleClick(event) {
        if (this.selectedBlockIndex === -1) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const gridX = Math.floor(x / this.renderer.blockSize);
        const gridY = Math.floor(y / this.renderer.blockSize);

        const selectedBlock = CONFIG.BLOCKS.TYPES[this.selectedBlockIndex];
        if (this.gameState.placeBlock(selectedBlock, gridX, gridY)) {
            this.audioManager.playPlaceSound();
            this.animationManager.addBlockPlaceAnimation(gridX, gridY, CONFIG.COLORS.BLOCKS[1]);

            // Update available blocks
            this.updateAvailableBlocks();
            this.selectedBlockIndex = -1;
        }
    }

    handleBlockSelect(index) {
        this.selectedBlockIndex = index;
    }

    updateAvailableBlocks() {
        const availableBlocks = this.gameState.getAvailableBlocks();
        this.renderer.drawBlockOptions(availableBlocks, this.selectedBlockIndex);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        document.getElementById(screenId).style.display = 'flex';
    }

    shareScore() {
        if (window.Telegram?.WebApp) {
            const score = this.gameState.score;
            const message = `🎮 I scored ${score} points in Block Rush!\n\nCan you beat my score? Try now:`;
            window.Telegram.WebApp.sendData(JSON.stringify({
                type: 'share_score',
                score: score,
                message: message
            }));
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

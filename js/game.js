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
        this.touchStartY = 0;

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
        this.preventSwipe = this.preventSwipe.bind(this);

        // Event listeners for the entire document
        document.addEventListener('touchstart', this.preventSwipe, { passive: false });
        document.addEventListener('touchmove', this.preventSwipe, { passive: false });
        document.addEventListener('touchend', this.preventSwipe, { passive: false });

        // Game-specific event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        document.getElementById('start-button').addEventListener('click', this.start);
        document.getElementById('restart-button').addEventListener('click', this.start);
        document.getElementById('share-button').addEventListener('click', () => this.shareScore());

        // Initialize Telegram WebApp
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
            
            // Prevent Telegram WebApp from closing on swipe
            window.Telegram.WebApp.onEvent('viewportChanged', () => {
                window.Telegram.WebApp.expand();
            });

            // Set up additional Telegram-specific handlers
            window.Telegram.WebApp.setBackgroundColor('#000000');
            window.Telegram.WebApp.enableClosingConfirmation();
        }

        // Set up the renderer's block selection callback
        this.renderer.onBlockSelect = this.handleBlockSelect;

        // Show start screen
        this.showScreen('start-screen');
    }

    preventSwipe(event) {
        // Always prevent default behavior for touch events
        event.preventDefault();
        
        if (event.type === 'touchstart') {
            this.touchStartY = event.touches[0].clientY;
        }
        
        // If it's a significant vertical swipe, prevent it
        if (event.type === 'touchmove' && event.touches[0]) {
            const touchY = event.touches[0].clientY;
            const deltaY = touchY - this.touchStartY;
            
            if (Math.abs(deltaY) > 10) { // Threshold for vertical swipe
                event.preventDefault();
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.expand();
                }
            }
        }
        
        return false;
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

        // Update animations
        this.animationManager.update(deltaTime);

        // Clear canvas
        this.renderer.clear();

        // Draw game elements
        this.renderer.drawGrid();
        this.renderer.drawBlocks(this.gameState.grid);
        
        // Draw block preview if one is selected
        if (this.selectedBlockIndex !== -1) {
            this.renderer.drawPreview(
                this.gameState.availableBlocks[this.selectedBlockIndex],
                this.mouseX,
                this.mouseY
            );
        }

        // Draw block options
        this.renderer.drawBlockOptions(this.gameState.availableBlocks, this.selectedBlockIndex);

        // Draw animations
        this.animationManager.draw(this.renderer.ctx);

        // Check game over
        if (this.gameState.checkGameOver()) {
            this.showGameOver();
            return;
        }

        requestAnimationFrame(this.update);
    }

    handleLineClear(lines) {
        if (lines.length === 0) return;

        // Add line clear animations
        lines.forEach(line => {
            this.animationManager.addLineClearAnimation(
                line.type,
                line.index,
                this.renderer.gridOffsetX,
                this.renderer.gridOffsetY,
                this.renderer.blockSize
            );
        });

        // Add score popup at a random cleared line
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        const score = CONFIG.SCORING.LINES[lines.length] || (CONFIG.SCORING.BASE_POINTS * lines.length);
        
        let popupX, popupY;
        if (randomLine.type === 'row') {
            popupX = this.renderer.gridOffsetX + (CONFIG.GAME.GRID_SIZE * this.renderer.blockSize) / 2;
            popupY = this.renderer.gridOffsetY + randomLine.index * this.renderer.blockSize;
        } else {
            popupX = this.renderer.gridOffsetX + randomLine.index * this.renderer.blockSize;
            popupY = this.renderer.gridOffsetY + (CONFIG.GAME.GRID_SIZE * this.renderer.blockSize) / 2;
        }

        this.animationManager.addScorePopup(score, popupX, popupY);

        // Add combo animation if applicable
        if (this.gameState.comboCount > 1) {
            this.animationManager.addComboAnimation(
                this.gameState.comboCount,
                this.canvas.width / 2,
                this.canvas.height / 2
            );
        }

        // Play sound effect
        this.audioManager.playSound('clear');
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (event.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = event.touches[0].clientX - rect.left;
            this.mouseY = event.touches[0].clientY - rect.top;
        }
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if clicked on a block option
        const blockIndex = this.renderer.isPointInBlockArea(x, y);
        if (blockIndex !== -1) {
            this.handleBlockSelect(blockIndex);
            return;
        }

        // Place block if one is selected
        if (this.selectedBlockIndex !== -1) {
            const gridX = Math.floor((x - this.renderer.gridOffsetX) / this.renderer.blockSize);
            const gridY = Math.floor((y - this.renderer.gridOffsetY) / this.renderer.blockSize);
            
            if (this.gameState.canPlaceBlock(this.gameState.availableBlocks[this.selectedBlockIndex], gridX, gridY)) {
                this.gameState.placeBlock(this.gameState.availableBlocks[this.selectedBlockIndex], gridX, gridY);
                this.selectedBlockIndex = -1;
                this.audioManager.playSound('place');
                this.updateAvailableBlocks();
            }
        }
    }

    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.touches[0].clientX - rect.left;
            const y = event.touches[0].clientY - rect.top;

            // Check if touched a block option
            const blockIndex = this.renderer.isPointInBlockArea(x, y);
            if (blockIndex !== -1) {
                this.handleBlockSelect(blockIndex);
            }

            this.mouseX = x;
            this.mouseY = y;
            this.isDragging = true;
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        if (this.isDragging && this.selectedBlockIndex !== -1) {
            const gridX = Math.floor((this.mouseX - this.renderer.gridOffsetX) / this.renderer.blockSize);
            const gridY = Math.floor((this.mouseY - this.renderer.gridOffsetY) / this.renderer.blockSize);
            
            if (this.gameState.canPlaceBlock(this.gameState.availableBlocks[this.selectedBlockIndex], gridX, gridY)) {
                this.gameState.placeBlock(this.gameState.availableBlocks[this.selectedBlockIndex], gridX, gridY);
                this.selectedBlockIndex = -1;
                this.audioManager.playSound('place');
                this.updateAvailableBlocks();
            }
        }
        this.isDragging = false;
    }

    handleBlockSelect(index) {
        if (index === this.selectedBlockIndex) {
            this.selectedBlockIndex = -1;
        } else {
            this.selectedBlockIndex = index;
            this.audioManager.playSound('select');
        }
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

    showGameOver() {
        this.stop();
        document.getElementById('final-score').textContent = `Score: ${this.gameState.score}`;
        this.showScreen('game-over-screen');
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

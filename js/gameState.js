class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.grid = Array(CONFIG.GAME.GRID_SIZE).fill().map(() => 
            Array(CONFIG.GAME.GRID_SIZE).fill(0)
        );
        this.score = 0;
        this.timeRemaining = CONFIG.GAME.ROUND_TIME;
        this.currentPhase = 1;
        this.comboCount = 0;
        this.selectedBlock = null;
        this.isGameOver = false;
        this.lastMoveTime = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
    }

    updatePhase() {
        const prevPhase = this.currentPhase;
        if (this.timeRemaining <= CONFIG.GAME.PHASES[3].START_TIME) {
            this.currentPhase = 3;
        } else if (this.timeRemaining <= CONFIG.GAME.PHASES[2].START_TIME) {
            this.currentPhase = 2;
        } else {
            this.currentPhase = 1;
        }
        return prevPhase !== this.currentPhase;
    }

    canPlaceBlock(block, x, y) {
        if (!block) return false;

        for (let i = 0; i < block.length; i++) {
            for (let j = 0; j < block[0].length; j++) {
                if (block[i][j]) {
                    const gridX = x + j;
                    const gridY = y + i;

                    if (gridX < 0 || gridX >= CONFIG.GAME.GRID_SIZE ||
                        gridY < 0 || gridY >= CONFIG.GAME.GRID_SIZE ||
                        this.grid[gridY][gridX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placeBlock(block, x, y) {
        if (!this.canPlaceBlock(block, x, y)) return false;

        for (let i = 0; i < block.length; i++) {
            for (let j = 0; j < block[0].length; j++) {
                if (block[i][j]) {
                    this.grid[y + i][x + j] = 1;
                }
            }
        }

        this.checkLines(x, y, block[0].length, block.length);
        return true;
    }

    checkLines(startX, startY, width, height) {
        const completedRows = [];
        const completedCols = [];

        // Check rows
        for (let y = startY; y < startY + height; y++) {
            if (y < CONFIG.GAME.GRID_SIZE && this.grid[y].every(cell => cell === 1)) {
                completedRows.push(y);
            }
        }

        // Check columns
        for (let x = startX; x < startX + width; x++) {
            if (x < CONFIG.GAME.GRID_SIZE && this.grid.every(row => row[x] === 1)) {
                completedCols.push(x);
            }
        }

        if (completedRows.length > 0 || completedCols.length > 0) {
            this.clearLines(completedRows, completedCols);
            this.updateScore(completedRows.length + completedCols.length);
        } else {
            this.comboCount = 0;
        }

        return { completedRows, completedCols };
    }

    clearLines(rows, cols) {
        // Clear rows
        rows.forEach(y => {
            this.grid[y].fill(0);
        });

        // Clear columns
        cols.forEach(x => {
            for (let y = 0; y < CONFIG.GAME.GRID_SIZE; y++) {
                this.grid[y][x] = 0;
            }
        });
    }

    updateScore(linesCleared) {
        if (linesCleared === 0) return;

        const basePoints = CONFIG.SCORING.LINES[linesCleared] || 
                         (CONFIG.SCORING.BASE_POINTS * linesCleared);
        const comboMultiplier = this.comboCount > 0 ? 
                               Math.pow(CONFIG.SCORING.COMBO_MULTIPLIER, this.comboCount) : 1;
        const phaseMultiplier = CONFIG.GAME.PHASES[this.currentPhase].MULTIPLIER;

        this.score += Math.floor(basePoints * comboMultiplier * phaseMultiplier);
        this.comboCount++;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore.toString());
        }
    }

    getAvailableBlocks() {
        return CONFIG.BLOCKS.TYPES.filter(block => {
            // Check if the block can be placed anywhere on the grid
            for (let y = 0; y < CONFIG.GAME.GRID_SIZE; y++) {
                for (let x = 0; x < CONFIG.GAME.GRID_SIZE; x++) {
                    if (this.canPlaceBlock(block, x, y)) {
                        return true;
                    }
                }
            }
            return false;
        });
    }

    isGameOverCondition() {
        return this.timeRemaining <= 0 || this.getAvailableBlocks().length === 0;
    }
}

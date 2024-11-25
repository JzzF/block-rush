class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.grid = Array(CONFIG.GAME.GRID_SIZE).fill().map(() => 
            Array(CONFIG.GAME.GRID_SIZE).fill(0)
        );
        this.score = 0;
        this.comboCount = 0;
        this.selectedBlock = null;
        this.isGameOver = false;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.availableBlocks = this.generateNewBlocks();
    }

    generateNewBlocks() {
        const blocks = [];
        for (let i = 0; i < CONFIG.BLOCKS.NUM_CHOICES; i++) {
            blocks.push(this.getRandomBlock());
        }
        return blocks;
    }

    getRandomBlock() {
        // Calculate total weight
        const totalWeight = CONFIG.BLOCKS.TYPES.reduce((sum, block) => sum + block.weight, 0);
        let random = Math.random() * totalWeight;
        
        // Select block based on weight
        for (let block of CONFIG.BLOCKS.TYPES) {
            random -= block.weight;
            if (random <= 0) {
                return {
                    type: block.pattern,
                    color: Math.floor(Math.random() * Object.keys(CONFIG.COLORS.BLOCKS).length) + 1
                };
            }
        }
        
        // Fallback to first block if something goes wrong
        return {
            type: CONFIG.BLOCKS.TYPES[0].pattern,
            color: 1
        };
    }

    canPlaceBlock(block, x, y) {
        if (!block || x < 0 || y < 0) return false;

        const pattern = block.type;
        if (x + pattern[0].length > CONFIG.GAME.GRID_SIZE || 
            y + pattern.length > CONFIG.GAME.GRID_SIZE) {
            return false;
        }

        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[0].length; j++) {
                if (pattern[i][j] && this.grid[y + i][x + j] !== 0) {
                    return false;
                }
            }
        }

        return true;
    }

    placeBlock(block, x, y) {
        if (!this.canPlaceBlock(block, x, y)) return false;

        const pattern = block.type;
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[0].length; j++) {
                if (pattern[i][j]) {
                    this.grid[y + i][x + j] = block.color;
                }
            }
        }

        this.checkLines();
        return true;
    }

    checkLines() {
        const clearedLines = [];
        
        // Check rows
        for (let y = 0; y < CONFIG.GAME.GRID_SIZE; y++) {
            if (this.grid[y].every(cell => cell !== 0)) {
                clearedLines.push({type: 'row', index: y});
            }
        }
        
        // Check columns
        for (let x = 0; x < CONFIG.GAME.GRID_SIZE; x++) {
            if (this.grid.every(row => row[x] !== 0)) {
                clearedLines.push({type: 'column', index: x});
            }
        }

        if (clearedLines.length > 0) {
            this.clearLines(clearedLines);
            this.updateScore(clearedLines.length);
            this.comboCount++;
        } else {
            this.comboCount = 0;
        }

        return clearedLines.length;
    }

    clearLines(lines) {
        lines.forEach(line => {
            if (line.type === 'row') {
                // Clear row
                for (let x = 0; x < CONFIG.GAME.GRID_SIZE; x++) {
                    this.grid[line.index][x] = 0;
                }
            } else {
                // Clear column
                for (let y = 0; y < CONFIG.GAME.GRID_SIZE; y++) {
                    this.grid[y][line.index] = 0;
                }
            }
        });
    }

    updateScore(linesCleared) {
        const basePoints = CONFIG.SCORING.LINES[linesCleared] || 
                         (CONFIG.SCORING.BASE_POINTS * linesCleared);
        const comboMultiplier = this.comboCount > 0 ? 
                               Math.pow(CONFIG.SCORING.COMBO_MULTIPLIER, this.comboCount - 1) : 1;
        
        this.score += Math.floor(basePoints * comboMultiplier);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
    }

    checkGameOver() {
        // Check if any block can be placed
        for (const block of this.availableBlocks) {
            for (let y = 0; y <= CONFIG.GAME.GRID_SIZE - block.type.length; y++) {
                for (let x = 0; x <= CONFIG.GAME.GRID_SIZE - block.type[0].length; x++) {
                    if (this.canPlaceBlock(block, x, y)) {
                        return false;
                    }
                }
            }
        }
        
        this.isGameOver = true;
        return true;
    }
}

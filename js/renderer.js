class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onBlockSelect = null;
        this.resize();

        // Handle canvas resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = document.getElementById('canvas-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Make the canvas square based on the smaller dimension
        const size = Math.min(containerWidth, containerHeight * 0.8);
        
        this.canvas.width = size;
        this.canvas.height = size * 1.2; // Extra space for block options
        
        // Calculate block size
        this.blockSize = Math.floor(size / CONFIG.GAME.GRID_SIZE);
        
        // Center the grid
        this.gridOffsetX = (this.canvas.width - (this.blockSize * CONFIG.GAME.GRID_SIZE)) / 2;
        this.gridOffsetY = this.blockSize / 2;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = CONFIG.COLORS.GRID;
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= CONFIG.GAME.GRID_SIZE; x++) {
            const xPos = this.gridOffsetX + (x * this.blockSize);
            this.ctx.beginPath();
            this.ctx.moveTo(xPos, this.gridOffsetY);
            this.ctx.lineTo(xPos, this.gridOffsetY + (CONFIG.GAME.GRID_SIZE * this.blockSize));
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= CONFIG.GAME.GRID_SIZE; y++) {
            const yPos = this.gridOffsetY + (y * this.blockSize);
            this.ctx.beginPath();
            this.ctx.moveTo(this.gridOffsetX, yPos);
            this.ctx.lineTo(this.gridOffsetX + (CONFIG.GAME.GRID_SIZE * this.blockSize), yPos);
            this.ctx.stroke();
        }
    }

    drawBlocks(grid) {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x]) {
                    this.drawBlock(
                        x * this.blockSize + this.gridOffsetX,
                        y * this.blockSize + this.gridOffsetY,
                        CONFIG.COLORS.BLOCKS[grid[y][x]]
                    );
                }
            }
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Add a slight 3D effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, 3);
        this.ctx.fillRect(x + 1, y + 1, 3, this.blockSize - 2);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(x + this.blockSize - 4, y + 1, 3, this.blockSize - 2);
        this.ctx.fillRect(x + 1, y + this.blockSize - 4, this.blockSize - 2, 3);
    }

    drawPreview(block, mouseX, mouseY) {
        if (!block) return;
        
        const blockPattern = block.type || block;
        const gridX = Math.floor((mouseX - this.gridOffsetX) / this.blockSize);
        const gridY = Math.floor((mouseY - this.gridOffsetY) / this.blockSize);

        if (gridX < 0 || gridY < 0) return;

        this.ctx.globalAlpha = 0.5;
        for (let i = 0; i < blockPattern.length; i++) {
            for (let j = 0; j < blockPattern[0].length; j++) {
                if (blockPattern[i][j]) {
                    const x = (gridX + j) * this.blockSize + this.gridOffsetX;
                    const y = (gridY + i) * this.blockSize + this.gridOffsetY;
                    this.drawBlock(x, y, CONFIG.COLORS.BLOCKS[block.color || 1]);
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }

    drawBlockOptions(blocks, selectedIndex) {
        const optionWidth = this.blockSize * 4;
        const optionHeight = this.blockSize * 4;
        const spacing = this.blockSize;
        const totalWidth = (optionWidth * blocks.length) + (spacing * (blocks.length - 1));
        const startX = (this.canvas.width - totalWidth) / 2;
        const startY = this.canvas.height - optionHeight - this.blockSize;

        blocks.forEach((block, index) => {
            const x = startX + (index * (optionWidth + spacing));
            const y = startY;

            // Draw option background
            this.ctx.fillStyle = index === selectedIndex ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(x, y, optionWidth, optionHeight);

            // Center the block pattern within the option area
            const pattern = block.type;
            const blockWidth = pattern[0].length * this.blockSize;
            const blockHeight = pattern.length * this.blockSize;
            const offsetX = x + (optionWidth - blockWidth) / 2;
            const offsetY = y + (optionHeight - blockHeight) / 2;

            // Draw the block pattern
            for (let i = 0; i < pattern.length; i++) {
                for (let j = 0; j < pattern[0].length; j++) {
                    if (pattern[i][j]) {
                        this.drawBlock(
                            offsetX + (j * this.blockSize),
                            offsetY + (i * this.blockSize),
                            CONFIG.COLORS.BLOCKS[block.color]
                        );
                    }
                }
            }
        });
    }

    // Helper method to check if a point is within a block option area
    isPointInBlockArea(x, y) {
        if (!this.blockAreas) return -1;
        
        for (let i = 0; i < this.blockAreas.length; i++) {
            const area = this.blockAreas[i];
            if (x >= area.x && x <= area.x + area.width &&
                y >= area.y && y <= area.y + area.height) {
                return i;
            }
        }
        return -1;
    }
}

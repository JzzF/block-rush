class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.blockSize = canvas.width / CONFIG.GAME.GRID_SIZE;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight);
        this.canvas.width = size;
        this.canvas.height = size;
        this.blockSize = size / CONFIG.GAME.GRID_SIZE;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = CONFIG.COLORS.GRID;
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= CONFIG.GAME.GRID_SIZE; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= CONFIG.GAME.GRID_SIZE; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }
    }

    drawBlocks(grid) {
        for (let y = 0; y < CONFIG.GAME.GRID_SIZE; y++) {
            for (let x = 0; x < CONFIG.GAME.GRID_SIZE; x++) {
                if (grid[y][x]) {
                    this.drawBlock(x, y, CONFIG.COLORS.BLOCKS[grid[y][x]]);
                }
            }
        }
    }

    drawBlock(x, y, color) {
        const padding = 1; // Padding for visual separation
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.blockSize + padding,
            y * this.blockSize + padding,
            this.blockSize - padding * 2,
            this.blockSize - padding * 2
        );
    }

    drawPreview(block, mouseX, mouseY) {
        if (!block) return;

        const gridX = Math.floor(mouseX / this.blockSize);
        const gridY = Math.floor(mouseY / this.blockSize);

        for (let y = 0; y < block.length; y++) {
            for (let x = 0; x < block[0].length; x++) {
                if (block[y][x]) {
                    const blockX = gridX + x;
                    const blockY = gridY + y;

                    if (blockX >= 0 && blockX < CONFIG.GAME.GRID_SIZE &&
                        blockY >= 0 && blockY < CONFIG.GAME.GRID_SIZE) {
                        this.ctx.fillStyle = CONFIG.COLORS.PREVIEW;
                        this.ctx.fillRect(
                            blockX * this.blockSize,
                            blockY * this.blockSize,
                            this.blockSize,
                            this.blockSize
                        );
                    }
                }
            }
        }
    }

    drawBlockOptions(blocks, selectedIndex) {
        const container = document.getElementById('blocks-container');
        container.innerHTML = '';

        blocks.forEach((block, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 60;
            canvas.height = 60;
            canvas.className = `block-option${index === selectedIndex ? ' selected' : ''}`;
            
            const ctx = canvas.getContext('2d');
            const blockSize = 20;

            // Draw block preview
            ctx.fillStyle = CONFIG.COLORS.BLOCKS[1];
            for (let y = 0; y < block.length; y++) {
                for (let x = 0; x < block[0].length; x++) {
                    if (block[y][x]) {
                        ctx.fillRect(
                            (x + (3 - block[0].length) / 2) * blockSize,
                            (y + (3 - block.length) / 2) * blockSize,
                            blockSize - 1,
                            blockSize - 1
                        );
                    }
                }
            }

            canvas.addEventListener('click', () => {
                document.querySelectorAll('.block-option').forEach(el => el.classList.remove('selected'));
                canvas.classList.add('selected');
                this.onBlockSelect?.(index);
            });

            container.appendChild(canvas);
        });
    }

    drawPhaseTransition(phase) {
        const text = `Phase ${phase}`;
        const multiplier = CONFIG.GAME.PHASES[phase].MULTIPLIER;
        const color = CONFIG.GAME.PHASES[phase].COLOR;

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 - 30);

        this.ctx.font = '24px Arial';
        this.ctx.fillText(
            `×${multiplier.toFixed(1)} Score Multiplier`,
            this.canvas.width / 2,
            this.canvas.height / 2 + 30
        );
        this.ctx.restore();
    }
}

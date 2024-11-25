class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    addBlockPlaceAnimation(x, y, color) {
        const animation = {
            type: 'blockPlace',
            startTime: performance.now(),
            duration: CONFIG.ANIMATIONS.PLACE_BLOCK.DURATION,
            x, y, color,
            progress: 0
        };

        this.animations.set(`block_${x}_${y}`, animation);
    }

    addLineClearAnimation(lines, isRow) {
        lines.forEach(line => {
            const animation = {
                type: 'lineClear',
                startTime: performance.now(),
                duration: CONFIG.ANIMATIONS.CLEAR_LINE.DURATION,
                line,
                isRow,
                progress: 0
            };

            this.animations.set(`line_${isRow ? 'row' : 'col'}_${line}`, animation);
        });
    }

    addComboAnimation(x, y, comboCount) {
        const animation = {
            type: 'combo',
            startTime: performance.now(),
            duration: CONFIG.ANIMATIONS.COMBO.DURATION,
            x, y,
            comboCount,
            progress: 0
        };

        this.animations.set(`combo_${Date.now()}`, animation);
    }

    addPhaseChangeAnimation() {
        const animation = {
            type: 'phaseChange',
            startTime: performance.now(),
            duration: CONFIG.ANIMATIONS.PHASE_CHANGE.DURATION,
            progress: 0
        };

        this.animations.set('phaseChange', animation);
    }

    update(currentTime) {
        for (const [key, animation] of this.animations.entries()) {
            const elapsed = currentTime - animation.startTime;
            animation.progress = Math.min(elapsed / animation.duration, 1);

            if (animation.progress >= 1) {
                this.animations.delete(key);
                continue;
            }

            switch (animation.type) {
                case 'blockPlace':
                    this.drawBlockPlaceAnimation(animation);
                    break;
                case 'lineClear':
                    this.drawLineClearAnimation(animation);
                    break;
                case 'combo':
                    this.drawComboAnimation(animation);
                    break;
                case 'phaseChange':
                    this.drawPhaseChangeAnimation(animation);
                    break;
            }
        }
    }

    drawBlockPlaceAnimation(animation) {
        const { x, y, color, progress } = animation;
        const scale = this.easeOutElastic(progress);
        const blockSize = this.canvas.width / CONFIG.GAME.GRID_SIZE;
        const centerX = (x + 0.5) * blockSize;
        const centerY = (y + 0.5) * blockSize;

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-centerX, -centerY);

        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * blockSize,
            y * blockSize,
            blockSize,
            blockSize
        );

        this.ctx.restore();
    }

    drawLineClearAnimation(animation) {
        const { line, isRow, progress } = animation;
        const blockSize = this.canvas.width / CONFIG.GAME.GRID_SIZE;
        const alpha = 1 - progress;
        const scale = 1 + progress * 0.2;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        if (isRow) {
            const centerY = (line + 0.5) * blockSize;
            this.ctx.translate(this.canvas.width / 2, centerY);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-this.canvas.width / 2, -centerY);
            this.ctx.fillStyle = CONFIG.COLORS.CLEARED;
            this.ctx.fillRect(0, line * blockSize, this.canvas.width, blockSize);
        } else {
            const centerX = (line + 0.5) * blockSize;
            this.ctx.translate(centerX, this.canvas.height / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-centerX, -this.canvas.height / 2);
            this.ctx.fillStyle = CONFIG.COLORS.CLEARED;
            this.ctx.fillRect(line * blockSize, 0, blockSize, this.canvas.height);
        }

        this.ctx.restore();
    }

    drawComboAnimation(animation) {
        const { x, y, comboCount, progress } = animation;
        const blockSize = this.canvas.width / CONFIG.GAME.GRID_SIZE;
        const text = `${comboCount}x Combo!`;
        const alpha = 1 - progress;
        const scale = 1 + progress * 0.5;
        const offsetY = -progress * 50;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = CONFIG.COLORS.BLOCKS[comboCount % 5 + 1];
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const centerX = (x + 0.5) * blockSize;
        const centerY = (y + 0.5) * blockSize + offsetY;

        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
    }

    drawPhaseChangeAnimation(animation) {
        const { progress } = animation;
        const alpha = Math.sin(progress * Math.PI);

        this.ctx.save();
        this.ctx.globalAlpha = alpha * 0.3;
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0
            ? 0
            : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }

    clear() {
        this.animations.clear();
    }
}

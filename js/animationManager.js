class AnimationManager {
    constructor() {
        this.animations = [];
        this.particles = [];
    }

    update(deltaTime) {
        // Update and filter out completed animations
        this.animations = this.animations.filter(animation => {
            animation.update(deltaTime);
            return !animation.isComplete;
        });

        // Update and filter out dead particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return !particle.isDead;
        });
    }

    draw(ctx) {
        // Draw all active animations
        this.animations.forEach(animation => animation.draw(ctx));
        this.particles.forEach(particle => particle.draw(ctx));
    }

    addLineClearAnimation(lineType, index, gridOffsetX, gridOffsetY, blockSize) {
        // Create line clear flash effect
        this.animations.push(new FlashAnimation(
            lineType === 'row' 
                ? { x: gridOffsetX, y: gridOffsetY + index * blockSize, width: blockSize * 10, height: blockSize }
                : { x: gridOffsetX + index * blockSize, y: gridOffsetY, width: blockSize, height: blockSize * 10 },
            'rgba(255, 255, 255, 0.8)',
            500 // duration in ms
        ));

        // Add particles along the cleared line
        const numParticles = 20;
        for (let i = 0; i < numParticles; i++) {
            let x, y;
            if (lineType === 'row') {
                x = gridOffsetX + Math.random() * blockSize * 10;
                y = gridOffsetY + index * blockSize + blockSize / 2;
            } else {
                x = gridOffsetX + index * blockSize + blockSize / 2;
                y = gridOffsetY + Math.random() * blockSize * 10;
            }

            this.particles.push(new Particle(
                x, y,
                Math.random() * 4 - 2, // random velocity X
                Math.random() * 4 - 2, // random velocity Y
                Math.random() * 3 + 1, // random size
                `hsl(${Math.random() * 60 + 40}, 100%, 60%)`, // golden colors
                1000 // lifetime in ms
            ));
        }
    }

    addScorePopup(score, x, y) {
        this.animations.push(new ScorePopup(score, x, y));
    }

    addComboAnimation(combo, x, y) {
        if (combo > 1) {
            this.animations.push(new ComboAnimation(combo, x, y));
            
            // Add celebratory particles
            const numParticles = combo * 5;
            for (let i = 0; i < numParticles; i++) {
                this.particles.push(new Particle(
                    x, y,
                    Math.random() * 8 - 4,
                    Math.random() * -6 - 2,
                    Math.random() * 4 + 2,
                    `hsl(${Math.random() * 360}, 100%, 50%)`,
                    1500
                ));
            }
        }
    }
}

class FlashAnimation {
    constructor(rect, color, duration) {
        this.rect = rect;
        this.color = color;
        this.duration = duration;
        this.elapsed = 0;
        this.isComplete = false;
    }

    update(deltaTime) {
        this.elapsed += deltaTime;
        if (this.elapsed >= this.duration) {
            this.isComplete = true;
        }
    }

    draw(ctx) {
        const alpha = 1 - (this.elapsed / this.duration);
        ctx.fillStyle = this.color.replace(')', `, ${alpha})`);
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }
}

class ScorePopup {
    constructor(score, x, y) {
        this.score = score;
        this.x = x;
        this.y = y;
        this.initialY = y;
        this.duration = 1000;
        this.elapsed = 0;
        this.isComplete = false;
    }

    update(deltaTime) {
        this.elapsed += deltaTime;
        if (this.elapsed >= this.duration) {
            this.isComplete = true;
        }
        
        // Move upward with easing
        const progress = this.elapsed / this.duration;
        this.y = this.initialY - (50 * Math.sin(progress * Math.PI));
    }

    draw(ctx) {
        const alpha = 1 - (this.elapsed / this.duration);
        const scale = 1 + Math.sin(this.elapsed / this.duration * Math.PI) * 0.5;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text = `+${this.score}`;
        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);
        
        ctx.restore();
    }
}

class ComboAnimation {
    constructor(combo, x, y) {
        this.combo = combo;
        this.x = x;
        this.y = y;
        this.duration = 1200;
        this.elapsed = 0;
        this.isComplete = false;
    }

    update(deltaTime) {
        this.elapsed += deltaTime;
        if (this.elapsed >= this.duration) {
            this.isComplete = true;
        }
    }

    draw(ctx) {
        const progress = this.elapsed / this.duration;
        const alpha = 1 - progress;
        const scale = 1 + Math.sin(progress * Math.PI) * 0.5;
        const angle = Math.sin(progress * Math.PI * 4) * 0.1;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = `rgba(255, 100, 100, ${alpha})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text = `${this.combo}x COMBO!`;
        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, vx, vy, size, color, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.lifetime = lifetime;
        this.elapsed = 0;
        this.isDead = false;
    }

    update(deltaTime) {
        this.elapsed += deltaTime;
        if (this.elapsed >= this.lifetime) {
            this.isDead = true;
            return;
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Add gravity effect
        this.vy += 0.1;
    }

    draw(ctx) {
        const alpha = 1 - (this.elapsed / this.lifetime);
        ctx.fillStyle = this.color.replace(')', `, ${alpha})`);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

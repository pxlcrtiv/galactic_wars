/**
 * Enemy class for managing different types of enemy ships
 * Includes various enemy types, attack patterns, and boss behaviors
 */
class Enemy {
    constructor(canvas, ctx, type = 'basic', wave = 1) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.type = type;
        this.wave = wave;
        
        // Set properties based on enemy type
        this.setEnemyProperties();
        
        // Initialize position
        this.reset();
        
        // Weapon properties
        this.lastShot = 0;
        this.projectiles = [];
    }
    
    setEnemyProperties() {
        switch(this.type) {
            case 'boss':
                this.width = 120;
                this.height = 100;
                this.speed = 2;
                this.health = 100 * this.wave;
                this.maxHealth = this.health;
                this.shootDelay = 1000;
                this.points = 500;
                this.color = '#ff4444';
                break;
            case 'elite':
                this.width = 60;
                this.height = 50;
                this.speed = 3;
                this.health = 30;
                this.shootDelay = 1500;
                this.points = 100;
                this.color = '#ff9900';
                break;
            default: // basic enemy
                this.width = 40;
                this.height = 40;
                this.speed = 4;
                this.health = 20;
                this.shootDelay = 2000;
                this.points = 50;
                this.color = '#ff0000';
        }
        
        // Scale properties with wave number
        if (this.type !== 'boss') {
            this.health += Math.floor(this.wave * 0.5);
            this.shootDelay = Math.max(1000, this.shootDelay - this.wave * 100);
        }
    }
    
    reset() {
        this.x = Math.random() * (this.canvas.width - this.width) + this.width / 2;
        this.y = -this.height;
        this.dx = this.speed * (Math.random() - 0.5);
        this.dy = this.speed * 0.5;
    }
    
    update() {
        // Update position
        this.x += this.dx;
        this.y += this.dy;
        
        // Bounce off walls
        if (this.x < this.width / 2 || this.x > this.canvas.width - this.width / 2) {
            this.dx = -this.dx;
        }
        
        // Boss specific movement
        if (this.type === 'boss') {
            if (this.y > this.canvas.height * 0.2) {
                this.y = this.canvas.height * 0.2;
                this.dy = 0;
            }
        }
        
        // Update projectiles
        this.updateProjectiles();
        
        // Try to shoot
        this.tryShoot();
    }
    
    draw() {
        this.ctx.save();
        
        // Draw enemy body
        this.ctx.fillStyle = this.color;
        this.drawEnemyBody();
        
        // Draw projectiles
        this.drawProjectiles();
        
        // Draw health bar for bosses and elite enemies
        if (this.type !== 'basic') {
            this.drawHealthBar();
        }
        
        this.ctx.restore();
    }
    
    drawEnemyBody() {
        if (this.type === 'boss') {
            // Draw boss ship
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y - this.height / 2);
            this.ctx.lineTo(this.x - this.width / 2, this.y);
            this.ctx.lineTo(this.x - this.width / 3, this.y + this.height / 2);
            this.ctx.lineTo(this.x + this.width / 3, this.y + this.height / 2);
            this.ctx.lineTo(this.x + this.width / 2, this.y);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Add details
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        } else {
            // Draw regular enemy
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y - this.height / 2);
            this.ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
            this.ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    drawHealthBar() {
        const barWidth = this.width;
        const barHeight = 5;
        const healthPercent = this.health / this.maxHealth;
        
        // Background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(
            this.x - barWidth / 2,
            this.y - this.height / 2 - 10,
            barWidth,
            barHeight
        );
        
        // Health
        this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
        this.ctx.fillRect(
            this.x - barWidth / 2,
            this.y - this.height / 2 - 10,
            barWidth * healthPercent,
            barHeight
        );
    }
    
    tryShoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shootDelay) return;
        
        this.lastShot = now;
        
        switch(this.type) {
            case 'boss':
                this.shootBossPattern();
                break;
            case 'elite':
                this.shootElitePattern();
                break;
            default:
                this.shootBasic();
        }
    }
    
    shootBasic() {
        this.projectiles.push({
            x: this.x,
            y: this.y + this.height / 2,
            width: 3,
            height: 10,
            speed: 5,
            damage: 10,
            color: '#ff0000'
        });
    }
    
    shootElitePattern() {
        const angles = [-30, 0, 30];
        angles.forEach(angle => {
            const rad = angle * Math.PI / 180;
            this.projectiles.push({
                x: this.x,
                y: this.y + this.height / 2,
                width: 4,
                height: 12,
                speed: 6,
                dx: Math.sin(rad) * 5,
                dy: Math.cos(rad) * 5,
                damage: 15,
                color: '#ff9900'
            });
        });
    }
    
    shootBossPattern() {
        // Multiple attack patterns for boss
        const patterns = [
            this.shootCirclePattern.bind(this),
            this.shootSpreadPattern.bind(this),
            this.shootLaserPattern.bind(this)
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        pattern();
    }
    
    shootCirclePattern() {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.projectiles.push({
                x: this.x,
                y: this.y,
                width: 6,
                height: 6,
                speed: 4,
                dx: Math.cos(angle) * 4,
                dy: Math.sin(angle) * 4,
                damage: 20,
                color: '#ff0000'
            });
        }
    }
    
    shootSpreadPattern() {
        const angles = [-45, -30, -15, 0, 15, 30, 45];
        angles.forEach(angle => {
            const rad = angle * Math.PI / 180;
            this.projectiles.push({
                x: this.x,
                y: this.y,
                width: 5,
                height: 15,
                speed: 5,
                dx: Math.sin(rad) * 5,
                dy: Math.cos(rad) * 5,
                damage: 25,
                color: '#ff4444'
            });
        });
    }
    
    shootLaserPattern() {
        const positions = [-this.width / 3, 0, this.width / 3];
        positions.forEach(xOffset => {
            this.projectiles.push({
                x: this.x + xOffset,
                y: this.y + this.height / 2,
                width: 8,
                height: 20,
                speed: 7,
                damage: 30,
                color: '#ff0000',
                isLaser: true
            });
        });
    }
    
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            // Update position
            if (projectile.dx !== undefined) {
                projectile.x += projectile.dx;
                projectile.y += projectile.dy;
            } else {
                projectile.y += projectile.speed;
            }
            
            // Remove if out of bounds
            return (
                projectile.x > 0 &&
                projectile.x < this.canvas.width &&
                projectile.y > 0 &&
                projectile.y < this.canvas.height
            );
        });
    }
    
    drawProjectiles() {
        this.projectiles.forEach(projectile => {
            this.ctx.fillStyle = projectile.color;
            
            if (projectile.isLaser) {
                this.ctx.shadowColor = projectile.color;
                this.ctx.shadowBlur = 10;
            }
            
            this.ctx.fillRect(
                projectile.x - projectile.width / 2,
                projectile.y - projectile.height / 2,
                projectile.width,
                projectile.height
            );
            
            if (projectile.isLaser) {
                this.ctx.shadowBlur = 0;
            }
        });
    }
    
    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    isOffscreen() {
        return this.y > this.canvas.height + this.height;
    }
}
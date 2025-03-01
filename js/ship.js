/**
 * Ship class for the player's spaceship
 * Includes advanced visual effects and animations
 */
class Ship {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = 50;
        this.height = 60;
        this.x = canvas.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.dx = 0; // Horizontal velocity
        
        // Weapon properties
        this.weaponType = 'basic';
        this.weaponLevel = 1;
        this.projectiles = [];
        this.lastShot = 0;
        this.shootDelay = 250; // Milliseconds between shots
        
        // Visual effects
        this.engineGlow = {
            radius: 15,
            opacity: 0.7,
            color: '#00ffff'
        };
        this.trailParticles = [];
    }
    
    update() {
        // Update position with smooth movement
        this.x += this.dx;
        
        // Keep ship within canvas bounds
        this.x = Math.max(this.width / 2, Math.min(this.canvas.width - this.width / 2, this.x));
        
        // Update projectiles
        this.updateProjectiles();
        
        // Update visual effects
        this.updateEffects();
    }
    
    draw() {
        // Draw engine glow
        this.drawEngineGlow();
        
        // Draw trail particles
        this.drawTrailParticles();
        
        // Draw ship body
        this.drawShipBody();
        
        // Draw projectiles
        this.drawProjectiles();
    }
    
    drawShipBody() {
        this.ctx.save();
        
        // Main body
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y - this.height / 2);
        this.ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        this.ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Details
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y - this.height / 2);
        this.ctx.lineTo(this.x, this.y + this.height / 3);
        this.ctx.stroke();
        
        // Wing highlights
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - this.width / 3, this.y);
        this.ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        this.ctx.moveTo(this.x + this.width / 3, this.y);
        this.ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawEngineGlow() {
        const gradient = this.ctx.createRadialGradient(
            this.x, this.y + this.height / 2,
            0,
            this.x, this.y + this.height / 2,
            this.engineGlow.radius
        );
        
        gradient.addColorStop(0, `${this.engineGlow.color}`);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.globalAlpha = this.engineGlow.opacity;
        this.ctx.fillRect(
            this.x - this.engineGlow.radius,
            this.y + this.height / 2 - this.engineGlow.radius,
            this.engineGlow.radius * 2,
            this.engineGlow.radius * 2
        );
        this.ctx.globalAlpha = 1;
    }
    
    updateEffects() {
        // Pulse engine glow
        this.engineGlow.opacity = 0.5 + Math.sin(Date.now() / 200) * 0.2;
        
        // Add new trail particles
        if (Math.random() < 0.3) {
            this.trailParticles.push({
                x: this.x + (Math.random() - 0.5) * 10,
                y: this.y + this.height / 2,
                radius: Math.random() * 3 + 1,
                opacity: 1,
                speed: Math.random() * 2 + 1
            });
        }
        
        // Update trail particles
        this.trailParticles = this.trailParticles.filter(particle => {
            particle.y += particle.speed;
            particle.opacity -= 0.02;
            return particle.opacity > 0;
        });
    }
    
    drawTrailParticles() {
        this.trailParticles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`;
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shootDelay) return;
        
        this.lastShot = now;
        
        switch(this.weaponType) {
            case 'spread':
                this.shootSpread();
                break;
            case 'laser':
                this.shootLaser();
                break;
            case 'homing':
                this.shootHoming();
                break;
            default:
                this.shootBasic();
        }
    }
    
    shootBasic() {
        this.projectiles.push({
            x: this.x,
            y: this.y - this.height / 2,
            width: 3,
            height: 15,
            speed: 10,
            damage: 10 * this.weaponLevel,
            color: '#00ffff'
        });
    }
    
    shootSpread() {
        const angles = [-15, 0, 15];
        angles.forEach(angle => {
            const rad = angle * Math.PI / 180;
            this.projectiles.push({
                x: this.x,
                y: this.y - this.height / 2,
                width: 3,
                height: 15,
                speed: 10,
                dx: Math.sin(rad) * 5,
                dy: -Math.cos(rad) * 10,
                damage: 8 * this.weaponLevel,
                color: '#ff00ff'
            });
        });
    }
    
    shootLaser() {
        this.projectiles.push({
            x: this.x,
            y: this.y - this.height / 2,
            width: 5,
            height: 30,
            speed: 15,
            damage: 15 * this.weaponLevel,
            color: '#ff0000',
            isLaser: true
        });
    }
    
    shootHoming() {
        this.projectiles.push({
            x: this.x,
            y: this.y - this.height / 2,
            width: 8,
            height: 8,
            speed: 8,
            damage: 12 * this.weaponLevel,
            color: '#ffff00',
            isHoming: true,
            turnSpeed: 0.1
        });
    }
    
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            // Update position
            if (projectile.dx !== undefined) {
                projectile.x += projectile.dx;
                projectile.y += projectile.dy;
            } else {
                projectile.y -= projectile.speed;
            }
            
            // Remove if out of bounds
            return projectile.y > -projectile.height;
        });
    }
    
    drawProjectiles() {
        this.projectiles.forEach(projectile => {
            this.ctx.fillStyle = projectile.color;
            
            if (projectile.isLaser) {
                // Draw laser with glow effect
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
    
    moveLeft() {
        this.dx = -this.speed;
    }
    
    moveRight() {
        this.dx = this.speed;
    }
    
    stopMoving() {
        this.dx = 0;
    }
    
    upgradeWeapon(type) {
        this.weaponType = type;
        this.weaponLevel = Math.min(this.weaponLevel + 1, 5);
        this.shootDelay = Math.max(150, this.shootDelay - 20);
    }
    
    reset() {
        this.x = this.canvas.width / 2;
        this.dx = 0;
        this.projectiles = [];
        this.weaponType = 'basic';
        this.weaponLevel = 1;
        this.shootDelay = 250;
    }
}
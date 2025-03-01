/**
 * Power-up System for Space Shooter Game
 * Handles creation, collection and effects of power-ups
 */

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.type = type; // 'multishot', 'shield', 'speedup'
        this.speed = 1.5;
        this.angle = 0;
        this.pulseSize = 0;
        this.pulseDirection = 1;
        
        // Set color based on power-up type
        switch(this.type) {
            case 'multishot':
                this.color = '#ff0'; // Yellow
                this.symbol = '+';
                break;
            case 'shield':
                this.color = '#0f0'; // Green
                this.symbol = 'S';
                break;
            case 'speedup':
                this.color = '#f0f'; // Purple
                this.symbol = '>';
                break;
            default:
                this.color = '#fff'; // White
                this.symbol = '?';
        }
    }
    
    draw(ctx) {
        // Save context state
        ctx.save();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        // Draw hexagon shape
        ctx.beginPath();
        const size = this.width/2 + this.pulseSize;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + this.angle;
            const x = this.x + size * Math.cos(angle);
            const y = this.y + size * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        
        // Fill and stroke
        ctx.fillStyle = 'rgba(' + this.color.substring(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(',') + ',0.3)';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        
        // Draw symbol
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, this.x, this.y);
        
        // Restore context state
        ctx.restore();
    }
    
    update() {
        // Move downward
        this.y += this.speed;
        
        // Rotate slowly
        this.angle += 0.02;
        
        // Pulse effect
        this.pulseSize += 0.1 * this.pulseDirection;
        if (this.pulseSize > 3 || this.pulseSize < 0) {
            this.pulseDirection *= -1;
        }
        
        // Return true if still on screen
        return this.y < CANVAS_HEIGHT + this.height;
    }
    
    // Apply power-up effect to player
    applyEffect(player, audioManager) {
        switch(this.type) {
            case 'multishot':
                player.powerUps.multishot = true;
                player.powerUpTimers.multishot = 500; // About 8 seconds at 60fps
                break;
            case 'shield':
                player.powerUps.shield = true;
                player.powerUpTimers.shield = 600; // About 10 seconds at 60fps
                break;
            case 'speedup':
                player.powerUps.speedup = true;
                player.powerUpTimers.speedup = 400; // About 6-7 seconds at 60fps
                break;
        }
        
        // Play power-up sound
        if (audioManager) {
            audioManager.playSound('powerup');
        }
    }
}

// PowerUp Manager to handle spawning and updating power-ups
class PowerUpManager {
    constructor() {
        this.powerUps = [];
        this.spawnRate = 0.002; // Chance per frame to spawn a power-up
        this.types = ['multishot', 'shield', 'speedup'];
    }
    
    update(ctx, player, audioManager) {
        // Possibly spawn a new power-up
        if (Math.random() < this.spawnRate) {
            this.spawnPowerUp();
        }
        
        // Update and draw existing power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();
            powerUp.draw(ctx);
            
            // Check for collision with player
            if (collision(player, powerUp)) {
                powerUp.applyEffect(player, audioManager);
                return false; // Remove this power-up
            }
            
            return powerUp.y < CANVAS_HEIGHT + powerUp.height;
        });
    }
    
    spawnPowerUp() {
        const type = this.types[Math.floor(Math.random() * this.types.length)];
        const x = Math.random() * (CANVAS_WIDTH - 50) + 25;
        this.powerUps.push(new PowerUp(x, -30, type));
    }
    
    // Reset all power-ups (for game restart)
    reset() {
        this.powerUps = [];
    }
}

// Export the PowerUpManager
const powerUpManager = new PowerUpManager();
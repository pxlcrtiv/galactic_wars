/**
 * GameManager class for handling game state, waves, and enemy spawning
 */
class GameManager {
    constructor(canvas, ctx, ship) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ship = ship;
        
        // Game state
        this.isRunning = false;
        this.score = 0;
        this.wave = 1;
        this.enemiesDefeated = 0;
        this.enemiesForNextWave = 10;
        this.bossDefeated = false;
        
        // Enemy management
        this.enemies = [];
        this.maxEnemies = 5;
        this.spawnDelay = 1500;
        this.lastSpawn = 0;
        this.bossActive = false;
        
        // Power-up management
        this.powerUps = [];
        this.powerUpTypes = ['spread', 'laser', 'homing', 'shield', 'speed'];
        
        // Audio manager reference
        this.audioManager = audioManager;
        
        // Wave notification
        this.waveNotification = {
            active: false,
            text: '',
            timer: 0,
            duration: 3000
        };
    }
    
    start() {
        this.isRunning = true;
        this.score = 0;
        this.wave = 1;
        this.enemiesDefeated = 0;
        this.enemiesForNextWave = 10;
        this.bossDefeated = false;
        this.enemies = [];
        this.powerUps = [];
        this.bossActive = false;
        
        // Show initial wave notification
        this.showWaveNotification(`Wave ${this.wave}`);
        
        // Initialize audio
        this.audioManager.init();
        this.audioManager.playMusic();
    }
    
    stop() {
        this.isRunning = false;
        this.audioManager.pauseMusic();
        this.audioManager.playSound('gameOver');
    }
    
    update(gameSpeed) {
        if (!this.isRunning) return;
        
        // Update wave notification
        this.updateWaveNotification();
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Update enemies
        this.updateEnemies();
        
        // Check for collisions
        this.checkCollisions();
        
        // Update power-ups
        this.updatePowerUps();
        
        // Check for wave completion
        this.checkWaveProgress();
    }
    
    draw() {
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw());
        
        // Draw power-ups
        this.drawPowerUps();
        
        // Draw wave notification
        this.drawWaveNotification();
    }
    
    spawnEnemies() {
        const now = Date.now();
        
        // Don't spawn if boss is active or max enemies reached
        if (this.bossActive || this.enemies.length >= this.maxEnemies || now - this.lastSpawn < this.spawnDelay) {
            return;
        }
        
        this.lastSpawn = now;
        
        // Determine enemy type
        let enemyType = 'basic';
        const roll = Math.random();
        
        if (roll > 0.9 - (this.wave * 0.05)) {
            enemyType = 'elite';
        }
        
        // Create new enemy
        const enemy = new Enemy(this.canvas, this.ctx, enemyType, this.wave);
        this.enemies.push(enemy);
    }
    
    spawnBoss() {
        this.bossActive = true;
        const boss = new Enemy(this.canvas, this.ctx, 'boss', this.wave);
        this.enemies.push(boss);
        
        // Show boss notification
        this.showWaveNotification(`BOSS BATTLE!`);
        
        // Play boss music or sound effect
        this.audioManager.playSound('bossWarning');
    }
    
    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.update();
            
            // Remove if offscreen
            if (enemy.isOffscreen()) {
                return false;
            }
            
            return true;
        });
    }
    
    checkCollisions() {
        // Check player projectiles hitting enemies
        this.ship.projectiles = this.ship.projectiles.filter(projectile => {
            let projectileHit = false;
            
            this.enemies = this.enemies.filter(enemy => {
                // Check if projectile hits enemy
                if (this.checkProjectileEnemyCollision(projectile, enemy)) {
                    projectileHit = true;
                    
                    // Apply damage
                    const destroyed = enemy.takeDamage(projectile.damage);
                    
                    if (destroyed) {
                        // Add score
                        this.score += enemy.points;
                        
                        // Increment enemies defeated
                        this.enemiesDefeated++;
                        
                        // Play explosion sound
                        this.audioManager.playSound('explosion');
                        
                        // Check if boss was defeated
                        if (enemy.type === 'boss') {
                            this.bossDefeated = true;
                            this.bossActive = false;
                            
                            // Spawn multiple power-ups for boss defeat
                            for (let i = 0; i < 3; i++) {
                                this.spawnPowerUp(enemy.x + (Math.random() - 0.5) * 50, enemy.y);
                            }
                        } else {
                            // Random chance to spawn power-up
                            if (Math.random() < 0.2) {
                                this.spawnPowerUp(enemy.x, enemy.y);
                            }
                        }
                        
                        return false; // Remove enemy
                    }
                    
                    return true; // Keep enemy
                }
                return true; // Keep enemy
            });
            
            return !projectileHit; // Remove projectile if it hit something
        });
        
        // Check enemy projectiles hitting player
        this.enemies.forEach(enemy => {
            enemy.projectiles = enemy.projectiles.filter(projectile => {
                if (this.checkProjectilePlayerCollision(projectile)) {
                    // Player hit by enemy projectile
                    this.handlePlayerHit();
                    return false; // Remove projectile
                }
                return true; // Keep projectile
            });
        });
        
        // Check power-up collisions with player
        this.powerUps = this.powerUps.filter(powerUp => {
            if (this.checkPowerUpPlayerCollision(powerUp)) {
                // Apply power-up effect
                this.applyPowerUp(powerUp.type);
                
                // Play power-up sound
                this.audioManager.playSound('powerup');
                
                return false; // Remove power-up
            }
            return true; // Keep power-up
        });
    }
    
    checkProjectileEnemyCollision(projectile, enemy) {
        return (
            projectile.x > enemy.x - enemy.width / 2 &&
            projectile.x < enemy.x + enemy.width / 2 &&
            projectile.y > enemy.y - enemy.height / 2 &&
            projectile.y < enemy.y + enemy.height / 2
        );
    }
    
    checkProjectilePlayerCollision(projectile) {
        return (
            projectile.x > this.ship.x - this.ship.width / 2 &&
            projectile.x < this.ship.x + this.ship.width / 2 &&
            projectile.y > this.ship.y - this.ship.height / 2 &&
            projectile.y < this.ship.y + this.ship.height / 2
        );
    }
    
    handlePlayerHit() {
        // Play hit sound
        this.audioManager.playSound('hit');
        
        // Flash the screen red
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Decrease score
        this.score = Math.max(0, this.score - 50);
        
        // Game over if score reaches 0
        if (this.score <= 0) {
            this.stop();
        }
    }
    
    spawnPowerUp(x, y) {
        const type = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
        
        this.powerUps.push({
            x: x,
            y: y,
            width: 30,
            height: 30,
            type: type,
            speed: 2,
            rotation: 0,
            rotationSpeed: 0.05
        });
    }
    
    updatePowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => {
            // Update position
            powerUp.y += powerUp.speed;
            
            // Update rotation for visual effect
            powerUp.rotation += powerUp.rotationSpeed;
            
            // Remove if offscreen
            return powerUp.y < this.canvas.height + powerUp.height;
        });
    }
    
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            
            // Translate to center of power-up for rotation
            this.ctx.translate(powerUp.x, powerUp.y);
            this.ctx.rotate(powerUp.rotation);
            
            // Draw power-up based on type
            switch(powerUp.type) {
                case 'spread':
                    this.drawSpreadPowerUp(powerUp);
                    break;
                case 'laser':
                    this.drawLaserPowerUp(powerUp);
                    break;
                case 'homing':
                    this.drawHomingPowerUp(powerUp);
                    break;
                case 'shield':
                    this.drawShieldPowerUp(powerUp);
                    break;
                case 'speed':
                    this.drawSpeedPowerUp(powerUp);
                    break;
            }
            
            this.ctx.restore();
        });
    }
    
    drawSpreadPowerUp(powerUp) {
        const size = powerUp.width / 2;
        
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.beginPath();
        this.ctx.moveTo(-size, -size);
        this.ctx.lineTo(0, -size * 1.5);
        this.ctx.lineTo(size, -size);
        this.ctx.lineTo(size, size);
        this.ctx.lineTo(-size, size);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawLaserPowerUp(powerUp) {
        const size = powerUp.width / 2;
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(-size, -size, size * 2, size * 2);
        
        // Add glow effect
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-size, -size, size * 2, size * 2);
        this.ctx.shadowBlur = 0;
    }
    
    drawHomingPowerUp(powerUp) {
        const size = powerUp.width / 2;
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawShieldPowerUp(powerUp) {
        const size = powerUp.width / 2;
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add shield effect
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.7, 0, Math.PI);
        this.ctx.stroke();
    }
    
    drawSpeedPowerUp(powerUp) {
        const size = powerUp.width / 2;
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(size, 0);
        this.ctx.lineTo(0, -size);
        this.ctx.lineTo(-size, 0);
        this.ctx.lineTo(0, size);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowColor = '#00ff00';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    checkPowerUpPlayerCollision(powerUp) {
        return (
            powerUp.x > this.ship.x - this.ship.width / 2 - powerUp.width / 2 &&
            powerUp.x < this.ship.x + this.ship.width / 2 + powerUp.width / 2 &&
            powerUp.y > this.ship.y - this.ship.height / 2 - powerUp.height /
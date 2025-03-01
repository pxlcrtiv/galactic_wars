// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_SPEED = 2;

// Game state
let canvas, ctx;
let player;
let bullets = [];
let enemies = [];
let particles = [];
let score = 0;
let gameLoop;

// Player object
class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT - this.height - 20;
        this.speed = PLAYER_SPEED;
        this.color = '#0ff';
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < CANVAS_WIDTH - this.width) {
            this.x += this.speed;
        }
    }

    shoot() {
        bullets.push(new Bullet(this.x + this.width / 2, this.y));
    }
}

// Bullet object
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = BULLET_SPEED;
        this.color = '#ff0';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    update() {
        this.y -= this.speed;
    }
}

// Enemy object
class Enemy {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = -this.height;
        this.speed = ENEMY_SPEED;
        this.color = '#f00';
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x, this.y);
        ctx.closePath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    update() {
        this.y += this.speed;
    }
}

// Particle effect
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
    }
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx = canvas.getContext('2d');
    
    player = new Player();
    
    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    gameLoop = setInterval(update, 1000/60);
}

// Handle keyboard input
let keys = {};

function handleKeyDown(e) {
    keys[e.key] = true;
    if (e.key === ' ') {
        player.shoot();
    }
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

// Update game state
function update() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Move player
    if (keys['ArrowLeft']) player.move('left');
    if (keys['ArrowRight']) player.move('right');
    
    // Update and draw player
    player.draw();
    
    // Update and draw bullets
    bullets = bullets.filter(bullet => {
        bullet.update();
        bullet.draw();
        return bullet.y > 0;
    });
    
    // Spawn enemies
    if (Math.random() < 0.02) {
        enemies.push(new Enemy());
    }
    
    // Update and draw enemies
    enemies = enemies.filter(enemy => {
        enemy.update();
        enemy.draw();
        return enemy.y < CANVAS_HEIGHT;
    });
    
    // Update and draw particles
    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.life > 0;
    });
    
    // Check collisions
    checkCollisions();
    
    // Draw score
    ctx.fillStyle = '#0ff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Collision detection
function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (collision(bullet, enemy)) {
                // Create explosion particles
                for (let i = 0; i < 10; i++) {
                    particles.push(new Particle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color));
                }
                
                // Remove bullet and enemy
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                
                // Increase score
                score += 100;
            }
        });
    });
}

// Simple collision detection
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Start game when page loads
window.onload = init;
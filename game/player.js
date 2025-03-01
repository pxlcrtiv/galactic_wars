/**
 * Player class for handling the basket movement and controls
 */
class Player {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Player dimensions
        this.width = 80;
        this.height = 60;
        
        // Player position
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        
        // Player movement
        this.speed = 8;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Load basket image
        this.image = new Image();
        this.image.src = '../canvas/basket.png';
        
        // Set up event listeners for keyboard and touch controls
        this.setupControls();
    }
    
    setupControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.moveLeft = true;
            if (e.key === 'ArrowRight') this.moveRight = true;
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.moveLeft = false;
            if (e.key === 'ArrowRight') this.moveRight = false;
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const touchX = touch.clientX - this.canvas.getBoundingClientRect().left;
            
            if (touchX < this.canvas.width / 2) {
                this.moveLeft = true;
                this.moveRight = false;
            } else {
                this.moveRight = true;
                this.moveLeft = false;
            }
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.moveLeft = false;
            this.moveRight = false;
        });
    }
    
    update() {
        // Move player based on controls
        if (this.moveLeft && this.x > 0) {
            this.x -= this.speed;
        }
        
        if (this.moveRight && this.x < this.canvas.width - this.width) {
            this.x += this.speed;
        }
    }
    
    draw() {
        // Draw the basket image if loaded, otherwise draw a rectangle
        if (this.image.complete) {
            this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            this.ctx.fillStyle = '#8B4513'; // Brown color for basket
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    // Check collision with a cookie
    checkCollision(cookie) {
        return (
            this.x < cookie.x + cookie.size &&
            this.x + this.width > cookie.x &&
            this.y < cookie.y + cookie.size &&
            this.y + this.height > cookie.y
        );
    }
    
    // Reset player position
    reset() {
        this.x = this.canvas.width / 2 - this.width / 2;
    }
}

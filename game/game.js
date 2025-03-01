/**
 * Game class for handling the main game logic
 */
class Game {
    constructor() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas dimensions
        this.resizeCanvas();
        
        // Game state
        this.isRunning = false;
        this.score = 0;
        this.gameSpeed = 1;
        this.gameSpeedIncrement = 0.0005;
        
        // Initialize game objects
        this.player = new Player(this.canvas, this.ctx);
        this.cookieManager = new CookieManager(this.canvas, this.ctx);
        this.highScore = new HighScore();
        
        // Update high score display
        this.highScore.updateDisplay();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        // Make canvas responsive
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = Math.min(500, window.innerHeight * 0.6);
        
        // Reset player position after resize
        if (this.player) {
            this.player.reset();
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.score = 0;
            this.gameSpeed = 1;
            this.updateScore();
            this.player.reset();
            this.cookieManager.reset();
            this.gameLoop();
        }
    }
    
    stop() {
        this.isRunning = false;
        
        // Check for new high score
        const newHighScore = this.highScore.saveHighScore(this.score);
        this.highScore.updateDisplay();
        
        // Show game over message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = '30px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Your Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        if (newHighScore) {
            this.ctx.fillStyle = '#FFD700'; // Gold color
            this.ctx.fillText('New High Score!', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update game objects
        this.player.update();
        this.cookieManager.update();
        
        // Check for collisions
        this.checkCollisions();
        
        // Draw game objects
        this.player.draw();
        this.cookieManager.draw();
        
        // Increase game speed gradually
        this.gameSpeed += this.gameSpeedIncrement;
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    checkCollisions() {
        // Check collisions with regular cookies
        for (const cookie of this.cookieManager.cookies) {
            if (this.player.checkCollision(cookie)) {
                // Caught a cookie
                this.score += 10;
                this.updateScore();
                cookie.reset();
            }
        }
        
        // Check collisions with burnt cookies
        for (const burntCookie of this.cookieManager.burntCookies) {
            if (this.player.checkCollision(burntCookie)) {
                // Caught a burnt cookie
                this.score = Math.max(0, this.score - 15); // Subtract points but don't go below 0
                this.updateScore();
                burntCookie.reset();
                
                // Flash the canvas red to indicate penalty
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // End game if score drops to 0
                if (this.score === 0) {
                    this.stop();
                }
            }
        }
    }
    
    updateScore() {
        const scoreElement = document.getElementById('currentScore');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
}
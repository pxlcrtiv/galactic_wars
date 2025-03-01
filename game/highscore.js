/**
 * HighScore class for managing the cookie-based high score system
 */
class HighScore {
    constructor() {
        this.cookieName = 'cookieCatcherHighScore';
        this.highScore = this.loadHighScore();
    }
    
    loadHighScore() {
        // Get high score from cookie
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(this.cookieName));
            
        if (cookie) {
            return parseInt(cookie.split('=')[1]) || 0;
        }
        return 0;
    }
    
    saveHighScore(score) {
        // Only save if it's a new high score
        if (score > this.highScore) {
            this.highScore = score;
            
            // Save to cookie (expires in 1 year)
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            
            document.cookie = `${this.cookieName}=${score}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
            
            return true; // New high score achieved
        }
        return false;
    }
    
    getHighScore() {
        return this.highScore;
    }
    
    // Update high score display
    updateDisplay() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }
    
    reset() {
        // Clear the high score cookie
        document.cookie = `${this.cookieName}=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
        this.highScore = 0;
        this.updateDisplay();
    }
}

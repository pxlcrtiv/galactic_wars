/**
 * Main script to initialize the game and handle the start button
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    const game = new Game();
    
    // Get the start button
    const startButton = document.getElementById('startButton');
    
    // Add event listener to start button
    startButton.addEventListener('click', () => {
        game.start();
        startButton.blur(); // Remove focus from button after click
    });
    
    // Handle keyboard start (spacebar)
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !game.isRunning) {
            game.start();
        }
    });
});

/**
 * Audio Manager for Space Shooter Game
 * Handles loading, playing, and controlling all game audio
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicPlaying = false;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.musicVolume = 0.5;
        this.soundVolume = 0.7;
    }

    /**
     * Initialize all game sounds
     */
    init() {
        // Load all sound effects
        this.loadSound('shoot', 'audio/laser-shoot.mp3');
        this.loadSound('explosion', 'audio/explosion.mp3');
        this.loadSound('powerup', 'audio/powerup.mp3');
        this.loadSound('hit', 'audio/hit.mp3');
        this.loadSound('gameOver', 'audio/game-over.mp3');
        
        // Load background music
        this.loadSound('bgMusic', 'audio/space-ambient.mp3', true);
    }

    /**
     * Load a sound file
     * @param {string} name - Reference name for the sound
     * @param {string} src - Path to the sound file
     * @param {boolean} isMusic - Whether this is background music (loopable)
     */
    loadSound(name, src, isMusic = false) {
        const audio = new Audio();
        audio.src = src;
        
        if (isMusic) {
            audio.loop = true;
            audio.volume = this.musicVolume;
        } else {
            audio.volume = this.soundVolume;
        }
        
        this.sounds[name] = audio;
        
        // Add error handling for missing audio files
        audio.onerror = () => {
            console.warn(`Failed to load sound: ${src}`);
        };
    }

    /**
     * Play a sound effect
     * @param {string} name - Name of the sound to play
     */
    playSound(name) {
        if (!this.soundEnabled || !this.sounds[name]) return;
        
        // For non-music sounds, clone and play to allow overlapping sounds
        if (name !== 'bgMusic') {
            const sound = this.sounds[name].cloneNode();
            sound.volume = this.soundVolume;
            sound.play().catch(e => console.warn('Audio play error:', e));
        } else {
            this.playMusic();
        }
    }

    /**
     * Play background music
     */
    playMusic() {
        if (!this.musicEnabled || this.musicPlaying) return;
        
        const music = this.sounds['bgMusic'];
        if (music) {
            music.play()
                .then(() => {
                    this.musicPlaying = true;
                })
                .catch(e => console.warn('Music play error:', e));
        }
    }

    /**
     * Pause background music
     */
    pauseMusic() {
        const music = this.sounds['bgMusic'];
        if (music && this.musicPlaying) {
            music.pause();
            this.musicPlaying = false;
        }
    }

    /**
     * Toggle sound effects on/off
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    /**
     * Toggle background music on/off
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        
        if (this.musicEnabled) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
        
        return this.musicEnabled;
    }

    /**
     * Set sound effect volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        
        // Update volume for non-music sounds
        Object.keys(this.sounds).forEach(key => {
            if (key !== 'bgMusic') {
                this.sounds[key].volume = this.soundVolume;
            }
        });
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.sounds['bgMusic']) {
            this.sounds['bgMusic'].volume = this.musicVolume;
        }
    }
}

// Export the AudioManager
const audioManager = new AudioManager();
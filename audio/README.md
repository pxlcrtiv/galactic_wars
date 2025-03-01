# Audio Files for Space Shooter Game

This directory contains all the audio files needed for the space shooter game.

## Required Sound Effects

The game requires the following audio files to be placed in this directory:

1. `laser-shoot.mp3` - Sound effect for player shooting
2. `explosion.mp3` - Sound effect for enemy explosions
3. `powerup.mp3` - Sound effect for collecting power-ups
4. `hit.mp3` - Sound effect for player getting hit
5. `game-over.mp3` - Sound effect for game over
6. `space-ambient.mp3` - Background music

## Audio Format

All audio files should be in MP3 format for best browser compatibility. WAV files can also be used as a fallback.

## Audio Sources

You can obtain free sound effects and music from the following sources:

- [Freesound](https://freesound.org/)
- [OpenGameArt](https://opengameart.org/)
- [Free Music Archive](https://freemusicarchive.org/)

Make sure to check the licensing terms for any audio files you download and use.

## Implementation

The audio system is implemented in the `js/audio.js` file, which handles loading, playing, and controlling all game audio. The AudioManager class provides methods for playing sounds, toggling sound on/off, and adjusting volume levels.
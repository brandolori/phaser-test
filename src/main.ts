import StartGame from './game/main';

/**
 * Application entry point.
 * Waits for DOM to be ready then initializes the Phaser game.
 */
document.addEventListener('DOMContentLoaded', () => {
  StartGame('game-container');
});

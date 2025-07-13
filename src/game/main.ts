import { Game as MainGame } from './scenes/Game';
import { AUTO, Game, Scale, Types } from 'phaser';

/**
 * Phaser 3 game configuration object.
 * Defines canvas size, physics settings, and scene list.
 * Find out more information about the Game Config at:
 * https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
 */
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800, x: 0 },
      debug: false,
    },
  },
  input: {
    gamepad: true,
  },
  scene: [MainGame],
};

/**
 * Creates and starts a new Phaser game instance.
 * @param parent - The DOM element ID where the game canvas will be attached
 * @returns A new Phaser Game instance
 */
const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;

import { Scene, Physics } from 'phaser';
import { Player } from '../Player';
import { GameSettings } from '../GameSettings';

/**
 * Main game scene handling the 2-player toaster platformer.
 * Manages players, platforms, camera, physics, and UI.
 */
export class Game extends Scene {
  /** First player instance (gold toaster) */
  private player1!: Player;
  /** Second player instance (teal toaster) */
  private player2!: Player;
  /** Static physics group containing all platforms */
  private platforms!: Physics.Arcade.StaticGroup;
  /** Reference to game settings singleton */
  private settings: GameSettings;

  /**
   * Creates the Game scene with default settings.
   */
  constructor() {
    super('Game');
    this.settings = GameSettings.getInstance();
  }

  /**
   * Preloads all required assets for the game.
   * Called automatically by Phaser before create().
   */
  preload() {
    this.load.setPath('assets');
    this.load.image('background', 'bg.png');
  }

  /**
   * Creates and initializes all game objects.
   * Called automatically by Phaser after preload() completes.
   */
  create() {
    this.physics.world.gravity.y = this.settings.gravityY;

    this.add
      .image(
        this.settings.levelWidth / 2,
        this.settings.levelHeight / 2,
        'background',
      )
      .setDisplaySize(this.settings.levelWidth, this.settings.levelHeight);

    this.createToasterTextures();
    this.createPlatforms();
    this.createPlayers();
    this.setupCamera();
    this.setupCollisions();
    this.createUI();

    this.physics.world.setBounds(
      0,
      0,
      this.settings.levelWidth,
      this.settings.levelHeight,
    );
  }

  /**
   * Updates the game state each frame.
   * Called automatically by Phaser at the target frame rate.
   */
  update() {
    if (this.player1 && this.player2) {
      this.player1.update();
      this.player2.update();
      this.updateCamera();
    }
  }

  /**
   * Creates procedural toaster textures for both players.
   * Generates gold and teal colored toaster sprites with heating elements.
   */
  private createToasterTextures() {
    const graphics = this.add.graphics();

    // Player 1 - Gold toaster
    graphics.fillStyle(0xffd700);
    graphics.fillRoundedRect(0, 0, 64, 64, 8);
    graphics.fillStyle(0xff6b35);
    graphics.fillRect(8, 8, 48, 20);
    graphics.fillRect(16, 40, 32, 8);
    graphics.generateTexture('toaster1', 64, 64);

    // Player 2 - Teal toaster
    graphics.clear();
    graphics.fillStyle(0x4ecdc4);
    graphics.fillRoundedRect(0, 0, 64, 64, 8);
    graphics.fillStyle(0xff6b35);
    graphics.fillRect(8, 8, 48, 20);
    graphics.fillRect(16, 40, 32, 8);
    graphics.generateTexture('toaster2', 64, 64);

    graphics.destroy();
  }

  /**
   * Creates all level platforms using static physics bodies.
   * Includes ground platform and floating platforms at various heights.
   */
  private createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    // Create platform texture
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // Ground platform
    this.platforms
      .create(
        this.settings.levelWidth / 2,
        this.settings.levelHeight - 50,
        'platform',
      )
      .setScale(this.settings.levelWidth / 200, 1)
      .refreshBody();

    // Additional platforms
    this.platforms.create(300, this.settings.levelHeight - 200, 'platform');
    this.platforms.create(600, this.settings.levelHeight - 300, 'platform');
    this.platforms.create(1000, this.settings.levelHeight - 250, 'platform');
    this.platforms.create(1400, this.settings.levelHeight - 200, 'platform');
    this.platforms.create(1700, this.settings.levelHeight - 350, 'platform');
  }

  /**
   * Creates both player instances with their respective control schemes.
   * Player 1 uses WASD controls, Player 2 uses arrow keys.
   */
  private createPlayers() {
    const player1Controls = {
      left: this.input.keyboard!.addKey('A'),
      right: this.input.keyboard!.addKey('D'),
      jump: this.input.keyboard!.addKey('W'),
      color: 0xffd700,
    };

    const player2Controls = {
      left: this.input.keyboard!.addKey('LEFT'),
      right: this.input.keyboard!.addKey('RIGHT'),
      jump: this.input.keyboard!.addKey('UP'),
      color: 0x4ecdc4,
    };

    this.player1 = new Player(this, 200, 100, 'toaster1', player1Controls);
    this.player2 = new Player(this, 300, 100, 'toaster2', player2Controls);
  }

  /**
   * Configures the camera system with bounds and deadzone.
   * Sets up level boundaries and smooth following behavior.
   */
  private setupCamera() {
    this.cameras.main.setBounds(
      0,
      0,
      this.settings.levelWidth,
      this.settings.levelHeight,
    );
    this.cameras.main.setDeadzone(100, 100);
  }

  /**
   * Sets up physics collisions between players and platforms.
   * Also enables player-to-player collision and pushing.
   */
  private setupCollisions() {
    this.physics.add.collider(this.player1, this.platforms);
    this.physics.add.collider(this.player2, this.platforms);
    this.physics.add.collider(this.player1, this.player2);
  }

  /**
   * Updates camera position to follow both players.
   * Centers camera on the midpoint between both player positions.
   */
  private updateCamera() {
    const centerX = (this.player1.x + this.player2.x) / 2;
    const centerY = (this.player1.y + this.player2.y) / 2;
    this.cameras.main.centerOn(centerX, centerY);
  }

  /**
   * Creates the user interface elements.
   * Displays game title and control instructions in a fixed overlay.
   */
  private createUI() {
    this.add
      .text(
        20,
        20,
        'TOASTER PLATFORMER\n\n' +
          'Player 1 (Gold): A/D to move, W to jump\n' +
          'Player 2 (Teal): ← / → to move, ↑ to jump\n\n' +
          'Both players can double-jump!\n' +
          'Push each other around!',
        {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 10, y: 10 },
        },
      )
      .setScrollFactor(0)
      .setDepth(1000);
  }
}

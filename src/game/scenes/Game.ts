import { Scene, Physics } from 'phaser';
import { Player } from '../Player';
import { ToastManager, ToastTimerInfo } from '../ToastManager';
import { GameSettings } from '../GameSettings';
import { LevelBuilder } from '../LevelBuilder';
import { InputManager } from '../InputManager';

/**
 * Main game scene handling the 3-player toaster platformer.
 * Manages players, platforms, camera, physics, and UI.
 */
export class Game extends Scene {
  /** First player instance (gold toaster) */
  private player1!: Player;
  /** Second player instance (teal toaster) */
  private player2!: Player;
  /** Third player instance (purple toaster) */
  private player3!: Player;
  /** Static physics group containing all platforms */
  private platforms!: Physics.Arcade.StaticGroup;
  /** Ground platform reference for toast collision */
  private groundPlatform!: Physics.Arcade.Sprite | null;
  /** Toast manager for handling multiple toast instances */
  private toastManager!: ToastManager;
  /** UI text displaying toast countdown timers */
  private toastTimerTexts!: Phaser.GameObjects.Text[];
  /** Level builder for constructing the game world */
  private levelBuilder!: LevelBuilder;
  /** Input manager for handling keyboard and gamepad input */
  private inputManager!: InputManager;
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
    this.load.audio('bell', 'sounds/bell.mp3');
    this.load.audio('clock-short', 'sounds/clock-short.mp3');
  }

  /**
   * Creates and initializes all game objects.
   * Called automatically by Phaser after preload() completes.
   */
  create() {
    this.physics.world.gravity.y = this.settings.gravityY;

    // Initialize input manager
    this.inputManager = new InputManager(this);
    this.setupInputConfiguration();

    // Initialize level builder and create the game world
    this.levelBuilder = new LevelBuilder(this);
    const levelConfig = LevelBuilder.createDefaultConfig();
    this.platforms = this.levelBuilder.build(levelConfig);
    this.groundPlatform = this.levelBuilder.getGroundPlatform();

    // Create game objects
    this.createToasterTextures();
    this.createToastTextures();
    this.createPlayers();
    this.createToasts();
    this.setupCamera();
    this.setupCollisions();
    this.createUI();
  }

  /**
   * Updates the game state each frame.
   * Called automatically by Phaser at the target frame rate.
   */
  update(_time: number, delta: number) {
    if (this.player1 && this.player2 && this.player3 && this.toastManager) {
      this.player1.update();
      this.player2.update();
      this.player3.update();
      this.toastManager.update(delta);
      this.updateCamera();
      this.updateToastTimers();
    }
  }

  /**
   * Creates procedural toaster textures for all three players.
   * Generates gold, teal, and purple colored toaster sprites with heating elements.
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

    // Player 3 - Purple toaster
    graphics.clear();
    graphics.fillStyle(0x9b59b6);
    graphics.fillRoundedRect(0, 0, 64, 64, 8);
    graphics.fillStyle(0xff6b35);
    graphics.fillRect(8, 8, 48, 20);
    graphics.fillRect(16, 40, 32, 8);
    graphics.generateTexture('toaster3', 64, 64);

    graphics.destroy();
  }

  /**
   * Creates toast textures for the hot-potato mechanic.
   * Generates different colored toast sprites for visual distinction.
   */
  private createToastTextures() {
    const graphics = this.add.graphics();

    // Toast 1 - Brown toast
    graphics.fillStyle(0x8b4513);
    graphics.fillRoundedRect(0, 0, 32, 24, 4);
    graphics.fillStyle(0xa0522d);
    graphics.fillRect(4, 4, 24, 16);
    graphics.generateTexture('toast1', 32, 24);

    // Toast 2 - Darker brown toast
    graphics.clear();
    graphics.fillStyle(0x654321);
    graphics.fillRoundedRect(0, 0, 32, 24, 4);
    graphics.fillStyle(0x8b4513);
    graphics.fillRect(4, 4, 24, 16);
    graphics.generateTexture('toast2', 32, 24);

    graphics.destroy();
  }

  /**
   * Sets up input configuration for both players.
   * Configures keyboard and gamepad controls for each player.
   */
  private setupInputConfiguration(): void {
    const inputConfigs = InputManager.createDefaultConfigs();

    // Configure input for both players
    inputConfigs.forEach((config) => {
      this.inputManager.configurePlayer(config);
    });

    // Log connected gamepads for debugging
    const connectedGamepads = this.inputManager.getConnectedGamepads();
    console.log('Connected gamepads:', connectedGamepads);
  }

  /**
   * Creates all three player instances with unified input system.
   * Player 1: WASD + Gamepad 0, Player 2: Arrow Keys + Gamepad 1, Player 3: IJKL + Gamepad 2.
   */
  private createPlayers() {
    const player1Config = {
      playerIndex: 0,
      color: 0xffd700,
    };

    const player2Config = {
      playerIndex: 1,
      color: 0x4ecdc4,
    };

    const player3Config = {
      playerIndex: 2,
      color: 0x9b59b6,
    };

    this.player1 = new Player(
      this,
      200,
      100,
      'toaster1',
      player1Config,
      this.inputManager,
    );
    this.player2 = new Player(
      this,
      300,
      100,
      'toaster2',
      player2Config,
      this.inputManager,
    );
    this.player3 = new Player(
      this,
      400,
      100,
      'toaster3',
      player3Config,
      this.inputManager,
    );
  }

  /**
   * Creates the toast manager and initializes multiple toasts.
   * Sets up the hot-potato mechanics for multiple toast instances.
   */
  private createToasts() {
    this.toastManager = new ToastManager(this);
    this.toastManager.setPlayers([this.player1, this.player2, this.player3]);
    this.toastManager.setGroundPlatform(this.groundPlatform);

    // Create multiple toasts based on settings
    for (let i = 0; i < this.settings.numberOfToasts; i++) {
      const toastId = `toast${i + 1}`;
      const texture = `toast${i + 1}`;

      // First toast starts with Player 1, second toast starts with Player 2
      let initialOwner = this.player1; // Default to Player 1
      if (i === 1 && this.player2) {
        initialOwner = this.player2; // Second toast starts with Player 2
      }

      this.toastManager.createToast(toastId, texture, initialOwner);
    }
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
   * Configures toast collision detection for pickup and ground reset.
   */
  private setupCollisions() {
    this.physics.add.collider(this.player1, this.platforms);
    this.physics.add.collider(this.player2, this.platforms);
    this.physics.add.collider(this.player3, this.platforms);
    this.physics.add.collider(this.player1, this.player2);
    this.physics.add.collider(this.player1, this.player3);
    this.physics.add.collider(this.player2, this.player3);

    // Setup toast collisions and overlaps through the manager
    this.toastManager.setupGroundCollisions();
    this.toastManager.setupPlayerOverlaps();
  }

  /**
   * Updates camera position to follow all three players.
   * Centers camera on the midpoint between all player positions.
   */
  private updateCamera() {
    const centerX = (this.player1.x + this.player2.x + this.player3.x) / 3;
    const centerY = (this.player1.y + this.player2.y + this.player3.y) / 3;
    this.cameras.main.centerOn(centerX, centerY);
  }

  /**
   * Creates the user interface elements.
   * Displays game title, control instructions, and toast timers in fixed overlays.
   */
  private createUI() {
    // Toast timer displays in upper-left corner
    this.toastTimerTexts = [];
    for (let i = 0; i < this.settings.numberOfToasts; i++) {
      const timerText = this.add
        .text(16, 16 + i * 25, '', {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setScrollFactor(0)
        .setDepth(1000);

      this.toastTimerTexts.push(timerText);
    }

    // Game info panel with controller support
    const connectedGamepads = this.inputManager.getConnectedGamepads();
    const gamepadInfo =
      connectedGamepads.length > 0
        ? `\n\nConnected Controllers: ${connectedGamepads.length}\n${connectedGamepads.map((pad) => `• ${pad.id} (index: ${pad.index})`).join('\n')}`
        : '\n\nNo controllers detected - using keyboard only';

    this.add
      .text(
        20,
        60,
        'TOASTER PLATFORMER - DUAL HOT POTATO TOAST (3 PLAYERS)\n\n' +
          'Player 1 (Gold): A/D/W keys OR Left Stick + A button (Controller 1)\n' +
          'Player 2 (Teal): Arrow keys OR Left Stick + A button (Controller 2)\n' +
          'Player 3 (Purple): J/L/I keys OR Left Stick + A button (Controller 3)\n\n' +
          'Hot Potato Rules:\n' +
          '• Two toast pieces with independent timers\n' +
          '• Each player can hold MAX 1 toast at a time\n' +
          '• Each timer counts down while toast is held\n' +
          '• Toast launches when timer hits 0\n' +
          '• Only OTHER players can catch flying toast\n' +
          '• Toast resets to original owner if it hits ground' +
          gamepadInfo,
        {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 10, y: 10 },
        },
      )
      .setScrollFactor(0)
      .setDepth(1000);
  }

  /**
   * Updates all toast timer displays.
   * Shows countdown when toasts are owned, flight status when flying.
   * Uses color coding for urgency levels.
   */
  private updateToastTimers() {
    const timerInfos = this.toastManager.getTimerInfo();

    timerInfos.forEach((info: ToastTimerInfo, index: number) => {
      if (index >= this.toastTimerTexts.length) return;

      const timerText = this.toastTimerTexts[index];

      if (info.isOwned) {
        // Color coding based on urgency
        let color = '#ffffff'; // Default white
        if (info.remainingTime <= 1.0) {
          color = '#ff0000'; // Red for critical (< 1s)
        } else if (info.remainingTime <= 2.0) {
          color = '#ff8800'; // Orange for warning (< 2s)
        } else {
          color = '#ffff00'; // Yellow for caution (< 3s)
        }

        timerText.setText(
          `${info.ownerName} ${info.id}: ${info.remainingTime.toFixed(1)} s`,
        );
        timerText.setColor(color);
        timerText.setVisible(true);
      } else {
        // Show flight status when toast is airborne
        timerText.setText(`🍞 ${info.id} in Flight - Catch it!`);
        timerText.setColor('#00ff00'); // Green for flight state
        timerText.setVisible(true);
      }
    });
  }
}

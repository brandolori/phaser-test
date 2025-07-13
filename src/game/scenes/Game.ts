import { Scene, Physics } from 'phaser';
import { Player } from '../Player';
import { Toast } from '../Toast';
import { ToastManager, ToastTimerInfo } from '../ToastManager';
import { GameSettings } from '../GameSettings';
import { InputManager } from '../InputManager';
import { InfiniteWorldManager } from '../InfiniteWorldManager';

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
  /** Input manager for handling keyboard and gamepad input */
  private inputManager!: InputManager;
  /** Infinite world manager for procedural generation */
  private infiniteWorldManager!: InfiniteWorldManager;
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
    this.load.image('toaster1', 'P10.png');
    this.load.image('toaster2', 'P20.png');
    this.load.image('toaster3', 'P30.png');
    this.load.image('toast1', 'Toast_10.png');
    this.load.image('toast2', 'Toast_20.png');
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

    // Create infinite background
    this.createInfiniteBackground();

    // Initialize platform texture for infinite world
    this.createPlatformTexture();

    // Initialize infinite world manager
    this.platforms = this.physics.add.staticGroup();
    this.infiniteWorldManager = new InfiniteWorldManager(this, this.platforms);
    this.infiniteWorldManager.initialize();

    // Remove world bounds for infinite gameplay
    this.physics.world.setBounds(0, 0, 0, 0);

    // Create game objects (textures are now loaded from preload)
    this.createPlayers();
    this.createToasts();
    this.setupCamera();
    this.setupCollisions();
    this.createUI();

    // Setup toast ground collisions with infinite world
    this.setupToastGroundCollisions();
  }

  /**
   * Updates the game state each frame.
   * Called automatically by Phaser at the target frame rate.
   */
  update(_time: number, delta: number) {
    if (
      this.player1 &&
      this.player2 &&
      this.player3 &&
      this.toastManager &&
      this.inputManager &&
      this.infiniteWorldManager
    ) {
      // Update input manager to track button state changes
      this.inputManager.update();

      this.player1.update();
      this.player2.update();
      this.player3.update();
      this.toastManager.update(delta);

      // Update infinite world based on player positions
      const centerX = (this.player1.x + this.player2.x + this.player3.x) / 3;
      this.infiniteWorldManager.update(centerX);

      this.updateCamera();
      this.updateToastTimers();
    }
  }

  /**
   * Creates an infinite scrolling background.
   */
  private createInfiniteBackground(): void {
    // Create a repeating background pattern
    const backgroundImage = this.add.image(
      0,
      this.settings.levelHeight / 2,
      'background',
    );
    backgroundImage.setOrigin(0, 0.5);
    backgroundImage.setDisplaySize(
      this.settings.levelHeight * 2,
      this.settings.levelHeight,
    );

    // The background will be managed by camera scroll factor
    backgroundImage.setScrollFactor(0.2); // Parallax effect
  }

  /**
   * Creates the platform texture for the infinite world.
   */
  private createPlatformTexture(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8b4513);
    graphics.fillRect(0, 0, 200, 32);
    graphics.generateTexture('platform', 200, 32);
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

    // Refresh gamepad detection and add keyboard listener for manual refresh
    this.inputManager.refreshGamepadDetection();

    // Add keyboard shortcut to refresh gamepad detection (G key)
    this.input.keyboard?.on('keydown-G', () => {
      this.inputManager.refreshGamepadDetection();
    });

    // Add game over shortcut (ESC key)
    this.input.keyboard?.on('keydown-ESC', () => {
      this.endGame();
    });

    // Check if no gamepads are detected and show instruction
    if (connectedGamepads.length === 0) {
      this.showGamepadInstructions();
    }

    // Add a message to the user
    console.log(
      '💡 Press G key to refresh gamepad detection, ESC to end game, or try pressing any button on your controller',
    );
  }

  /**
   * Shows instructions for gamepad activation
   */
  private showGamepadInstructions(): void {
    // Create overlay text to instruct user about gamepad interaction
    const instructionText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 100,
        'GAMEPAD SETUP\n\nPress any button on your controller\nto activate gamepad support\n\nPress G to refresh detection',
        {
          fontFamily: 'monospace',
          fontSize: '24px',
          color: '#ffff00',
          stroke: '#000000',
          strokeThickness: 2,
          align: 'center',
        },
      )
      .setOrigin(0.5);

    instructionText.setScrollFactor(0); // Keep fixed on screen
    instructionText.setDepth(1000); // Always on top

    // Remove the instruction after gamepad is detected or 10 seconds
    const checkGamepads = () => {
      const gamepads = this.inputManager.getConnectedGamepads();
      if (gamepads.length > 0) {
        instructionText.destroy();
        console.log('✅ Gamepad detected - removing instructions');
        return;
      }
      // Check again in 1 second
      this.time.delayedCall(1000, checkGamepads);
    };

    // Start checking and auto-remove after 10 seconds
    this.time.delayedCall(1000, checkGamepads);
    this.time.delayedCall(10000, () => {
      if (instructionText.active) {
        instructionText.destroy();
      }
    });
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
   * Configures the camera system for infinite world.
   * Removes horizontal bounds and sets up smooth following behavior.
   */
  private setupCamera() {
    // Remove horizontal bounds for infinite scrolling, keep vertical bounds
    this.cameras.main.setBounds(
      -Number.MAX_SAFE_INTEGER / 2,
      0,
      Number.MAX_SAFE_INTEGER,
      this.settings.levelHeight,
    );
    this.cameras.main.setDeadzone(200, 100);
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

    // Setup toast-player overlaps through the manager
    this.toastManager.setupPlayerOverlaps();
  }

  /**
   * Sets up collision detection between toasts and ground platforms in infinite world.
   */
  private setupToastGroundCollisions(): void {
    // Set up collision with all platforms (including ground)
    this.toastManager.getAllToasts().forEach((toast) => {
      this.physics.add.collider(
        toast,
        this.platforms,
        (toastObj, platformObj) => {
          const toast = toastObj as Toast;
          const platform = platformObj as Physics.Arcade.Sprite;

          // Check if this is a ground platform (based on Y position)
          const groundY =
            this.settings.levelHeight - this.settings.groundHeight;
          if (platform.y >= groundY - 50) {
            // Some tolerance for ground detection
            // Reset to Player 1 when hitting ground
            toast.handleGroundHit(this.player1);
          }
        },
      );
    });
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

  /**
   * Ends the current game and transitions to the game over scene.
   */
  private endGame(): void {
    console.log('🏁 Game ended by player');

    // Play end sound if available
    try {
      this.sound.play('bell', { volume: 0.3 });
    } catch {
      // Sound not available
    }

    // Transition to game over scene
    this.scene.start('GameOverScene');
  }
}

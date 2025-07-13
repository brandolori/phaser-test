import { Scene, Physics } from 'phaser';
import { Player } from '../Player';
import { Toast } from '../Toast';
import { GameSettings } from '../GameSettings';
import { LevelBuilder } from '../LevelBuilder';
import { InputManager } from '../InputManager';

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
  /** Ground platform reference for toast collision */
  private groundPlatform!: Physics.Arcade.Sprite | null;
  /** Toast object for hot-potato mechanic */
  private toast!: Toast;
  /** UI text displaying toast countdown timer */
  private toastTimerText!: Phaser.GameObjects.Text;
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
    this.createToastTexture();
    this.createPlayers();
    this.createToast();
    this.setupCamera();
    this.setupCollisions();
    this.createUI();
  }

  /**
   * Updates the game state each frame.
   * Called automatically by Phaser at the target frame rate.
   */
  update(_time: number, delta: number) {
    if (this.player1 && this.player2 && this.toast) {
      this.player1.update();
      this.player2.update();
      this.toast.update(delta);
      this.updateCamera();
      this.updateToastTimer();
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
   * Creates the toast texture for the hot-potato mechanic.
   * Generates a brown rectangular toast sprite.
   */
  private createToastTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8b4513);
    graphics.fillRoundedRect(0, 0, 32, 24, 4);
    graphics.fillStyle(0xa0522d);
    graphics.fillRect(4, 4, 24, 16);
    graphics.generateTexture('toast', 32, 24);
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
   * Creates both player instances with unified input system.
   * Player 1 supports WASD + Gamepad 0, Player 2 supports Arrow Keys + Gamepad 1.
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
  }

  /**
   * Creates the toast object and initializes it with Player 1.
   * Sets up the hot-potato mechanic starting state.
   */
  private createToast() {
    this.toast = new Toast(this, 0, 0, 'toast');
    this.toast.resetToPlayer1(this.player1);
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
    this.physics.add.collider(this.player1, this.player2);

    // Toast collision only with ground platform (not floating platforms)
    if (this.groundPlatform) {
      this.physics.add.collider(this.toast, this.groundPlatform, () => {
        this.toast.handleGroundHit(this.player1);
      });
    }

    // Toast overlap with players for pickup detection
    this.physics.add.overlap(this.toast, this.player1, () => {
      if (!this.toast.isOwned() && this.toast.canBePickedUpBy(this.player1)) {
        this.toast.pickupBy(this.player1);
      }
    });

    this.physics.add.overlap(this.toast, this.player2, () => {
      if (!this.toast.isOwned() && this.toast.canBePickedUpBy(this.player2)) {
        this.toast.pickupBy(this.player2);
      }
    });
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
   * Displays game title, control instructions, and toast timer in fixed overlays.
   */
  private createUI() {
    // Toast timer display in upper-left corner
    this.toastTimerText = this.add
      .text(16, 16, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(1000);

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
        'TOASTER PLATFORMER - HOT POTATO TOAST\n\n' +
          'Player 1 (Gold): A/D/W keys OR Left Stick + A button (Controller 1)\n' +
          'Player 2 (Teal): Arrow keys OR Left Stick + A button (Controller 2)\n\n' +
          'Hot Potato Rules:\n' +
          '• Toast starts with Player 1\n' +
          '• Timer counts down while held\n' +
          '• Toast launches when timer hits 0\n' +
          '• Only the OTHER player can catch it\n' +
          '• Toast resets to Player 1 if it hits ground' +
          gamepadInfo,
        {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 10, y: 10 },
        },
      )
      .setScrollFactor(0)
      .setDepth(1000);
  }

  /**
   * Updates the toast timer display.
   * Shows countdown when toast is owned, flight status when flying.
   * Uses color coding for urgency levels.
   */
  private updateToastTimer() {
    if (this.toast.isOwned()) {
      const remaining = this.toast.getRemainingTime();
      const owner = this.toast.getCurrentOwner();
      const ownerName = owner === this.player1 ? 'Player 1' : 'Player 2';

      // Color coding based on urgency
      let color = '#ffffff'; // Default white
      if (remaining <= 1.0) {
        color = '#ff0000'; // Red for critical (< 1s)
      } else if (remaining <= 2.0) {
        color = '#ff8800'; // Orange for warning (< 2s)
      } else {
        color = '#ffff00'; // Yellow for caution (< 3s)
      }

      this.toastTimerText.setText(
        `${ownerName} Toast: ${remaining.toFixed(1)} s`,
      );
      this.toastTimerText.setColor(color);
      this.toastTimerText.setVisible(true);
    } else {
      // Show flight status when toast is airborne
      this.toastTimerText.setText('🍞 Toast in Flight - Catch it!');
      this.toastTimerText.setColor('#00ff00'); // Green for flight state
      this.toastTimerText.setVisible(true);
    }
  }
}

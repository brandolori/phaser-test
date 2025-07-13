import { Scene, Physics } from 'phaser';
import { Player } from '../Player';
import { Toast } from '../Toast';
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
  /** Toast object for hot-potato mechanic */
  private toast!: Toast;
  /** UI text displaying toast countdown timer */
  private toastTimerText!: Phaser.GameObjects.Text;
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
    this.createToastTexture();
    this.createPlatforms();
    this.createPlayers();
    this.createToast();
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

    // Toast collision with platforms triggers ground reset
    this.physics.add.collider(this.toast, this.platforms, () => {
      this.toast.handleGroundHit(this.player1);
    });

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

    // Game info panel
    this.add
      .text(
        20,
        60,
        'TOASTER PLATFORMER - HOT POTATO TOAST\n\n' +
          'Player 1 (Gold): A/D to move, W to jump\n' +
          'Player 2 (Teal): ← / → to move, ↑ to jump\n\n' +
          'Hot Potato Rules:\n' +
          '• Toast starts with Player 1\n' +
          '• Timer counts down while held\n' +
          '• Toast launches when timer hits 0\n' +
          '• Only the OTHER player can catch it\n' +
          '• Toast resets to Player 1 if it hits ground',
        {
          fontFamily: 'Arial',
          fontSize: '14px',
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

import { Scene } from 'phaser';
import { GameStats } from '../GameStats';

/**
 * MenuScene displays the main menu and game instructions.
 * Handles game start and displays controls information.
 */
export class MenuScene extends Scene {
  private startText!: Phaser.GameObjects.Text;
  private gameStats: GameStats;

  /**
   * Creates the MenuScene.
   */
  constructor() {
    super({ key: 'MenuScene' });
    this.gameStats = GameStats.getInstance();
  }

  /**
   * Creates the menu interface.
   */
  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Create background
    this.createBackground();

    // Title
    this.add
      .text(centerX, centerY - 200, 'TOASTER PLATFORMER', {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(centerX, centerY - 150, 'Hot-Potato Toast Mayhem!', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#FF6B35',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    // Menu buttons
    const startButton = this.add
      .text(centerX, centerY - 20, 'START GAME', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    const instructionsButton = this.add
      .text(centerX, centerY + 30, 'INSTRUCTIONS', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#4ECDC4',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    // Make buttons interactive
    this.setupButton(startButton, '#00FF00', '#FFFF00', () => this.startGame());
    this.setupButton(instructionsButton, '#4ECDC4', '#FFFFFF', () =>
      this.showInstructions(),
    );

    // Controls hint
    this.startText = this.add
      .text(
        centerX,
        centerY + 120,
        'SPACE/ENTER to start • I for instructions • Controller support',
        {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#CCCCCC',
          stroke: '#000000',
          strokeThickness: 1,
          align: 'center',
        },
      )
      .setOrigin(0.5);

    // Blinking animation for start text
    this.tweens.add({
      targets: this.startText,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Setup input handlers
    this.setupInputHandlers();

    // Add version info
    this.add.text(
      10,
      this.cameras.main.height - 30,
      'v1.0.0 - Infinite World',
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#888888',
      },
    );
  }

  /**
   * Creates background with gradient effect.
   */
  private createBackground(): void {
    // Create gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001122, 0x001122, 0x003366, 0x003366);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Add some animated background elements
    this.createBackgroundElements();
  }

  /**
   * Creates animated background elements.
   */
  private createBackgroundElements(): void {
    // Create floating toast sprites for decoration
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
      const y = Phaser.Math.Between(50, this.cameras.main.height - 50);

      const toast = this.add.rectangle(x, y, 30, 20, 0x8b4513);
      toast.setAlpha(0.3);

      // Float animation
      this.tweens.add({
        targets: toast,
        y: y - 50,
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Rotation animation
      this.tweens.add({
        targets: toast,
        rotation: Math.PI * 2,
        duration: Phaser.Math.Between(8000, 12000),
        repeat: -1,
      });
    }
  }

  /**
   * Sets up a button with hover effects and click handler.
   */
  private setupButton(
    button: Phaser.GameObjects.Text,
    normalColor: string,
    hoverColor: string,
    onClick: () => void,
  ): void {
    button.setInteractive();
    button.on('pointerdown', onClick);
    button.on('pointerover', () => button.setColor(hoverColor));
    button.on('pointerout', () => button.setColor(normalColor));
  }

  /**
   * Sets up input handlers for menu navigation.
   */
  private setupInputHandlers(): void {
    // Keyboard input
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.startGame();
    });

    this.input.keyboard?.once('keydown-ENTER', () => {
      this.startGame();
    });

    this.input.keyboard?.once('keydown-I', () => {
      this.showInstructions();
    });

    // Gamepad input - A button starts, B button shows instructions
    this.input.gamepad?.on(
      'down',
      (_pad: unknown, button: { index: number }) => {
        if (button.index === 0) {
          // A button
          this.startGame();
        } else if (button.index === 1) {
          // B button
          this.showInstructions();
        }
      },
    );
  }

  /**
   * Starts the game by transitioning to the main game scene.
   */
  private startGame(): void {
    // Play a sound effect if available
    try {
      this.sound.play('bell', { volume: 0.5 });
    } catch {
      // Sound not available, continue silently
    }

    // Reset game statistics for new round
    this.gameStats.startNewRound();

    // Transition to game scene
    this.scene.start('Game');
  }

  /**
   * Shows the instructions scene.
   */
  private showInstructions(): void {
    // Play a sound effect if available
    try {
      this.sound.play('bell', { volume: 0.3 });
    } catch {
      // Sound not available, continue silently
    }

    // Transition to instructions scene
    this.scene.start('InstructionsScene');
  }
}

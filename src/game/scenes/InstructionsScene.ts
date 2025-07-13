import { Scene } from 'phaser';

/**
 * InstructionsScene displays detailed game instructions and controls.
 * Accessed from the main menu for comprehensive information about gameplay.
 */
export class InstructionsScene extends Scene {
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private instructionText!: Phaser.GameObjects.Text;

  /**
   * Creates the InstructionsScene.
   */
  constructor() {
    super({ key: 'InstructionsScene' });
  }

  /**
   * Creates the instructions interface with scrollable content.
   */
  create(): void {
    const centerX = this.cameras.main.width / 2;

    // Create background
    this.createBackground();

    // Title
    this.add
      .text(centerX, 50, 'GAME INSTRUCTIONS', {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Back button
    const backButton = this.add
      .text(50, 50, '← BACK TO MENU', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setScrollFactor(0);

    backButton.setInteractive();
    backButton.on('pointerdown', () => this.returnToMenu());
    backButton.on('pointerover', () => backButton.setColor('#FFFF00'));
    backButton.on('pointerout', () => backButton.setColor('#00FF00'));

    // Create scrollable content
    this.createScrollableContent();

    // Setup input handlers
    this.setupInputHandlers();

    // Instructions for navigation
    this.add
      .text(
        centerX,
        this.cameras.main.height - 30,
        'Use ARROW KEYS or SCROLL WHEEL to navigate • ESC to return to menu',
        {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#CCCCCC',
          align: 'center',
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  /**
   * Creates background with subtle pattern.
   */
  private createBackground(): void {
    // Dark gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001133, 0x001133, 0x002244, 0x002244);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setScrollFactor(0);
  }

  /**
   * Creates scrollable instruction content.
   */
  private createScrollableContent(): void {
    const startY = 120;
    const leftMargin = 50;
    const rightMargin = this.cameras.main.width - 50;
    const contentWidth = rightMargin - leftMargin;

    const instructionsContent = this.getInstructionsContent();

    this.instructionText = this.add.text(
      leftMargin,
      startY,
      instructionsContent,
      {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 1,
        lineSpacing: 8,
        wordWrap: { width: contentWidth },
      },
    );

    // Calculate max scroll based on content height
    this.maxScrollY = Math.max(
      0,
      this.instructionText.height - (this.cameras.main.height - 200),
    );

    // Set up camera scrolling
    this.cameras.main.setScroll(0, 0);
  }

  /**
   * Gets the comprehensive instructions content.
   */
  private getInstructionsContent(): string {
    return `🎮 TOASTER PLATFORMER - HOT POTATO TOAST

🎯 OBJECTIVE
Avoid holding the toast when the timer runs out! Pass the toast between players while 
exploring the infinite world.

👥 PLAYERS & CONTROLS

🟡 PLAYER 1 (Gold Toaster)
  Keyboard: A/D to move, W to jump
  Controller: Left stick or D-pad to move, A button to jump

🟢 PLAYER 2 (Teal Toaster)  
  Keyboard: ←/→ arrow keys to move, ↑ to jump
  Controller: Left stick or D-pad to move, A button to jump

🟣 PLAYER 3 (Purple Toaster)
  Keyboard: J/L to move, I to jump
  Controller: Left stick or D-pad to move, A button to jump

🎮 CONTROLLER SETUP
• Supports Xbox controllers via Bluetooth
• Up to 3 controllers can be connected simultaneously
• Controller 1 → Player 1, Controller 2 → Player 2, Controller 3 → Player 3
• Automatic fallback to keyboard if controller disconnects
• Press G in-game to refresh gamepad detection

🍞 HOT POTATO MECHANICS

⏰ Toast Timer System
• Each toast has a 3-second countdown timer
• Timer only counts down while a player is holding the toast
• Visual timer display shows remaining time and current owner
• Color-coded urgency: Green → Orange → Red

🔄 Passing Rules
• Pass toast by running into another player
• Only players who DON'T already have a toast can catch one
• Last owner cannot immediately pick up the same toast (alternation rule)
• Multiple toasts can be in play simultaneously

💥 Auto-Ejection
• Toast automatically launches when timer reaches zero
• Ejected toast flies in the direction the player was moving
• Flying toast can be caught by any other player
• Player gets brief immunity after ejection

🌍 Reset Conditions
• Toast resets to Player 1 when it hits the ground
• Toast resets if it goes off-screen (world bounds)

🏃 MOVEMENT & PHYSICS

🦘 Jumping System
• Single jump: Press jump button once
• Double jump: Press jump button again while in air
• Each player has 2 jumps before needing to touch ground
• Jump height varies: full jump first, reduced jump second

⚡ Movement Mechanics
• Different speeds for ground vs air movement
• Player-to-player collision and pushing enabled
• Momentum conservation during toast ejection
• Gravity affects all players and flying toasts

🌍 INFINITE WORLD EXPLORATION

🗺️ Procedural Generation
• World extends infinitely in both directions
• Ground platform generates automatically as you explore
• No invisible walls - true infinite exploration
• Camera follows all players dynamically

📍 Navigation
• Camera centers on the midpoint between all players
• Smooth following with deadzone to prevent micro-movements
• Vertical bounds maintained for gameplay clarity

🎮 GAME CONTROLS & OPTIONS

⌨️ In-Game Shortcuts
• G key: Refresh gamepad detection
• ESC key: End current round and view statistics
• Works during gameplay for quick access

🏁 Game Over & Statistics
• End game anytime with ESC key
• Detailed statistics tracking:
  - Round duration
  - Number of toast passes
  - Auto-ejections count
  - Longest hold time
  - Per-player performance

📊 Achievement System
• Automatic milestone detection
• Performance badges for exceptional gameplay
• Encourages longer sessions and skillful play

🎯 STRATEGY TIPS

🧠 Positioning
• Stay close to other players to pass toast quickly
• Use double-jump to reach elevated positions
• Corner players to force toast acceptance

⏰ Timing Management
• Monitor timer colors for urgency levels
• Pass toast early to avoid auto-ejection
• Use sound cues: beeps indicate timer warnings

🤝 Team Play
• Coordinate with other players for optimal passing
• Create passing chains to keep toast moving
• Use player pushing to help with positioning

🏃 Mobility Tactics
• Keep moving to make catching harder for others
• Use air movement to escape with toast
• Explore infinite world to find advantageous positions

🔊 AUDIO CUES

🔔 Sound Effects
• Bell sound: Toast ejection
• Clock short: Final second warning (red timer)
• Clock long: Warning at 0.75 seconds (orange timer)
• Audio provides crucial timing information

🎵 Audio Strategy
• Learn sound patterns for better timing
• Use audio cues when visual timer is not visible
• Combine audio and visual information for optimal play

🏆 SCORING & PERFORMANCE

📈 Statistics Tracked
• Game duration (automatically formatted)
• Toast passes between players
• Number of auto-ejections
• Longest single hold time
• Individual player toast counts

🥇 Performance Metrics
• Players ranked by total toast interactions
• Achievement unlocks for milestones
• Perfect game recognition (no ejections)
• Marathon session acknowledgment

🎮 TECHNICAL INFORMATION

💻 System Requirements
• Modern web browser with gamepad API support
• Bluetooth capability for wireless controller connection
• JavaScript enabled
• Recommended: Chrome, Firefox, Safari, Edge

🔧 Troubleshooting
• Controllers not detected: Press G to refresh detection
• Latency issues: Try wired connection instead of Bluetooth
• Performance problems: Close other browser tabs
• Audio not working: Check browser audio permissions

📱 Accessibility
• Full keyboard support for all functions
• High contrast visual timers
• Audio cues for timing information
• Scalable UI elements

Ready to start your hot potato adventure? Return to the main menu and begin!`;
  }

  /**
   * Sets up input handlers for navigation and menu return.
   */
  private setupInputHandlers(): void {
    // Keyboard navigation
    this.input.keyboard?.on('keydown-UP', () => this.scroll(-30));
    this.input.keyboard?.on('keydown-DOWN', () => this.scroll(30));
    this.input.keyboard?.on('keydown-ESC', () => this.returnToMenu());

    // Mouse wheel scrolling
    this.input.on(
      'wheel',
      (
        _pointer: unknown,
        _gameObjects: unknown,
        _deltaX: number,
        deltaY: number,
      ) => {
        this.scroll(deltaY * 0.5);
      },
    );

    // Gamepad navigation
    this.input.gamepad?.on(
      'down',
      (_pad: unknown, button: { index: number }) => {
        if (button.index === 1) {
          // B button - back to menu
          this.returnToMenu();
        }
      },
    );
  }

  /**
   * Scrolls the content by the specified amount.
   * @param deltaY - Amount to scroll (positive = down, negative = up)
   */
  private scroll(deltaY: number): void {
    this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY, 0, this.maxScrollY);
    this.cameras.main.setScroll(0, this.scrollY);
  }

  /**
   * Returns to the main menu.
   */
  private returnToMenu(): void {
    this.scene.start('MenuScene');
  }
}

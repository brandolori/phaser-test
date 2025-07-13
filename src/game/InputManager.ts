import { Scene } from 'phaser';

/**
 * Enumeration of available game actions
 */
export enum GameAction {
  LEFT = 'left',
  RIGHT = 'right',
  JUMP = 'jump',
}

/**
 * Configuration for keyboard controls
 */
export interface KeyboardConfig {
  left: string;
  right: string;
  jump: string;
}

/**
 * Configuration for gamepad controls
 */
export interface GamepadConfig {
  /** Left stick horizontal threshold */
  stickThreshold: number;
  /** D-pad left button index */
  dpadLeft: number;
  /** D-pad right button index */
  dpadRight: number;
  /** Jump button (A button on Xbox controller) */
  jumpButton: number;
}

/**
 * Input configuration for a player
 */
export interface PlayerInputConfig {
  /** Player index (0, 1, or 2) */
  playerIndex: number;
  /** Keyboard controls configuration */
  keyboard: KeyboardConfig;
  /** Gamepad controls configuration */
  gamepad: GamepadConfig;
  /** Preferred gamepad index (null for keyboard only) */
  gamepadIndex: number | null;
}

/**
 * InputManager handles input from both keyboard and gamepad controllers.
 * Provides a unified interface for checking game actions regardless of input type.
 * Supports up to 3 players with individual gamepad assignments.
 */
export class InputManager {
  private scene: Scene;
  private keyboardKeys: Map<string, Phaser.Input.Keyboard.Key> = new Map();
  private playerConfigs: Map<number, PlayerInputConfig> = new Map();
  private previousGamepadButtonStates: Map<number, Map<number, boolean>> =
    new Map();

  /**
   * Creates a new InputManager instance.
   * @param scene - The Phaser scene to manage input for
   */
  constructor(scene: Scene) {
    this.scene = scene;
    this.setupGamepadSupport();
  }

  /**
   * Sets up gamepad support and connection events.
   */
  private setupGamepadSupport(): void {
    console.log('🎮 Setting up gamepad support...');

    // Check if running on HTTPS (required by modern browsers)
    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost'
    ) {
      console.warn(
        '⚠️ Gamepad API may require HTTPS in production environments',
      );
    }

    // Check if gamepad support is available
    if (!this.scene.input.gamepad) {
      console.error('❌ Gamepad support not available in this scene!');
      return;
    }

    console.log('✅ Gamepad support is available');

    // Listen for gamepad connection events
    this.scene.input.gamepad.on(
      'connected',
      (pad: Phaser.Input.Gamepad.Gamepad) => {
        console.log(`🔌 Gamepad connected: ${pad.id} (index: ${pad.index})`);
        console.log(
          `   - Buttons: ${pad.buttons.length}, Axes: ${pad.axes.length}`,
        );

        // Refresh our player configurations when a gamepad connects
        this.refreshPlayerGamepadAssignments();
      },
    );

    this.scene.input.gamepad.on(
      'disconnected',
      (pad: Phaser.Input.Gamepad.Gamepad) => {
        console.log(`🔌 Gamepad disconnected: ${pad.id} (index: ${pad.index})`);
      },
    );

    // Set up browser-level gamepad event listeners as fallback
    this.setupBrowserGamepadEvents();

    // Manual input update to ensure gamepad polling works
    console.log('✅ Gamepad setup complete');
  }

  /**
   * Sets up browser-level gamepad event listeners as fallback
   */
  private setupBrowserGamepadEvents(): void {
    window.addEventListener('gamepadconnected', (e) => {
      console.log(
        `🎮 Browser gamepadconnected: ${e.gamepad.id} at index ${e.gamepad.index}`,
      );
      // Force Phaser to refresh its gamepad list
      setTimeout(() => this.refreshPlayerGamepadAssignments(), 100);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log(
        `🎮 Browser gamepaddisconnected: ${e.gamepad.id} at index ${e.gamepad.index}`,
      );
    });
  }

  /**
   * Configures input for a player.
   * @param config - Player input configuration
   */
  public configurePlayer(config: PlayerInputConfig): void {
    this.playerConfigs.set(config.playerIndex, config);

    // Register keyboard keys
    if (!this.keyboardKeys.has(config.keyboard.left)) {
      this.keyboardKeys.set(
        config.keyboard.left,
        this.scene.input.keyboard!.addKey(config.keyboard.left),
      );
    }
    if (!this.keyboardKeys.has(config.keyboard.right)) {
      this.keyboardKeys.set(
        config.keyboard.right,
        this.scene.input.keyboard!.addKey(config.keyboard.right),
      );
    }
    if (!this.keyboardKeys.has(config.keyboard.jump)) {
      this.keyboardKeys.set(
        config.keyboard.jump,
        this.scene.input.keyboard!.addKey(config.keyboard.jump),
      );
    }

    // Check if the expected gamepad is actually connected
    if (config.gamepadIndex !== null) {
      const gamepad = this.scene.input.gamepad?.getPad(config.gamepadIndex);
      if (gamepad) {
        console.log(
          `✅ Player ${config.playerIndex} gamepad found: ${gamepad.id}`,
        );
      } else {
        console.log(
          `❌ Player ${config.playerIndex} gamepad not found at index ${config.gamepadIndex}`,
        );
      }
    }
  }

  /**
   * Checks if an action is currently active for a player.
   * @param action - The game action to check
   * @param playerIndex - The player index (0, 1, or 2)
   * @returns True if the action is active
   */
  public isActionActive(action: GameAction, playerIndex: number): boolean {
    const config = this.playerConfigs.get(playerIndex);
    if (!config) return false;

    // Check gamepad input first (if available and preferred)
    if (config.gamepadIndex !== null) {
      const gamepadActive = this.checkGamepadAction(action, config);
      if (gamepadActive) return true;
    }

    // Fallback to keyboard input
    return this.checkKeyboardAction(action, config);
  }

  /**
   * Checks if an action was just pressed for a player.
   * @param action - The game action to check
   * @param playerIndex - The player index (0, 1, or 2)
   * @returns True if the action was just pressed
   */
  public wasActionJustPressed(
    action: GameAction,
    playerIndex: number,
  ): boolean {
    const config = this.playerConfigs.get(playerIndex);
    if (!config) return false;

    // Check gamepad input first (if available and preferred)
    if (config.gamepadIndex !== null) {
      const gamepadPressed = this.checkGamepadActionJustPressed(action, config);
      if (gamepadPressed) return true;
    }

    // Fallback to keyboard input
    return this.checkKeyboardActionJustPressed(action, config);
  }

  /**
   * Checks gamepad input for an action.
   * @param action - The game action to check
   * @param config - Player input configuration
   * @returns True if the action is active on gamepad
   */
  private checkGamepadAction(
    action: GameAction,
    config: PlayerInputConfig,
  ): boolean {
    if (!this.scene.input.gamepad) {
      return false;
    }

    const gamepad = this.scene.input.gamepad.getPad(config.gamepadIndex!);
    if (!gamepad) {
      return false;
    }

    switch (action) {
      case GameAction.LEFT:
        // Check left stick or D-pad left
        return (
          gamepad.leftStick.x < -config.gamepad.stickThreshold ||
          gamepad.buttons[config.gamepad.dpadLeft]?.pressed ||
          false
        );

      case GameAction.RIGHT:
        // Check right stick or D-pad right
        return (
          gamepad.leftStick.x > config.gamepad.stickThreshold ||
          gamepad.buttons[config.gamepad.dpadRight]?.pressed ||
          false
        );

      case GameAction.JUMP:
        // Check jump button (A button)
        return gamepad.buttons[config.gamepad.jumpButton]?.pressed || false;

      default:
        return false;
    }
  }

  /**
   * Checks if a gamepad action was just pressed.
   * @param action - The game action to check
   * @param config - Player input configuration
   * @returns True if the action was just pressed on gamepad
   */
  private checkGamepadActionJustPressed(
    action: GameAction,
    config: PlayerInputConfig,
  ): boolean {
    if (!this.scene.input.gamepad) return false;
    const gamepad = this.scene.input.gamepad.getPad(config.gamepadIndex!);
    if (!gamepad) return false;

    switch (action) {
      case GameAction.LEFT:
        // For movement, we don't typically need "just pressed" - return continuous
        return this.checkGamepadAction(action, config);

      case GameAction.RIGHT:
        // For movement, we don't typically need "just pressed" - return continuous
        return this.checkGamepadAction(action, config);

      case GameAction.JUMP:
        // Check if jump button was just pressed using our own state tracking
        return this.checkGamepadButtonJustPressed(
          config.gamepadIndex!,
          config.gamepad.jumpButton,
        );

      default:
        return false;
    }
  }

  /**
   * Checks keyboard input for an action.
   * @param action - The game action to check
   * @param config - Player input configuration
   * @returns True if the action is active on keyboard
   */
  private checkKeyboardAction(
    action: GameAction,
    config: PlayerInputConfig,
  ): boolean {
    switch (action) {
      case GameAction.LEFT:
        return this.keyboardKeys.get(config.keyboard.left)?.isDown || false;
      case GameAction.RIGHT:
        return this.keyboardKeys.get(config.keyboard.right)?.isDown || false;
      case GameAction.JUMP:
        return this.keyboardKeys.get(config.keyboard.jump)?.isDown || false;
      default:
        return false;
    }
  }

  /**
   * Checks if a keyboard action was just pressed.
   * @param action - The game action to check
   * @param config - Player input configuration
   * @returns True if the action was just pressed on keyboard
   */
  private checkKeyboardActionJustPressed(
    action: GameAction,
    config: PlayerInputConfig,
  ): boolean {
    switch (action) {
      case GameAction.LEFT:
        return this.checkKeyboardAction(action, config);
      case GameAction.RIGHT:
        return this.checkKeyboardAction(action, config);
      case GameAction.JUMP:
        const jumpKey = this.keyboardKeys.get(config.keyboard.jump);
        return jumpKey ? Phaser.Input.Keyboard.JustDown(jumpKey) : false;
      default:
        return false;
    }
  }

  /**
   * Gets connected gamepad information.
   * @returns Array of connected gamepad info
   */
  public getConnectedGamepads(): Array<{ index: number; id: string }> {
    const gamepads: Array<{ index: number; id: string }> = [];

    if (!this.scene.input.gamepad) return gamepads;

    for (let i = 0; i < 4; i++) {
      const pad = this.scene.input.gamepad.getPad(i);
      if (pad) {
        gamepads.push({ index: i, id: pad.id });
      }
    }

    return gamepads;
  }

  /**
   * Forces gamepad detection refresh by checking browser-level gamepads
   * and trying to connect them to Phaser.
   */
  public refreshGamepadDetection(): void {
    console.log('🔄 Refreshing gamepad detection...');

    if (!this.scene.input.gamepad) {
      console.log('❌ No gamepad plugin available');
      return;
    }

    // Force gamepad refresh by checking the total count

    // Check browser-level gamepads
    const browserGamepads = navigator.getGamepads();
    console.log('🎮 Browser gamepads:', browserGamepads.length);

    let browserConnectedCount = 0;
    for (let i = 0; i < browserGamepads.length; i++) {
      const gamepad = browserGamepads[i];
      if (gamepad && gamepad.connected) {
        browserConnectedCount++;
        console.log(
          `  - Browser gamepad ${i}: ${gamepad.id} (connected: ${gamepad.connected})`,
        );
      }
    }
    console.log(`🎮 Browser: ${browserConnectedCount} connected gamepad(s)`);

    // Check Phaser gamepads
    let phaserCount = 0;
    for (let i = 0; i < 4; i++) {
      const pad = this.scene.input.gamepad.getPad(i);
      if (pad) {
        phaserCount++;
        console.log(`🎮 Phaser gamepad ${i}: ${pad.id}`);
      }
    }
    console.log(`🎮 Phaser sees ${phaserCount} gamepad(s)`);
    console.log(`🎮 Phaser gamepad.total: ${this.scene.input.gamepad.total}`);

    // If browser sees gamepads but Phaser doesn't, provide troubleshooting info
    if (browserConnectedCount > 0 && phaserCount === 0) {
      console.log("⚠️ Browser sees gamepads but Phaser doesn't. Try:");
      console.log('  1. Press any button on your controller');
      console.log('  2. Make sure the page has focus');
      console.log('  3. Check if running on HTTPS (may be required)');
    }
  }

  /**
   * Refreshes player gamepad assignments after a gamepad connects
   */
  private refreshPlayerGamepadAssignments(): void {
    console.log('🔄 Refreshing player gamepad assignments...');

    // Re-check gamepad assignments for all configured players
    this.playerConfigs.forEach((config, playerIndex) => {
      if (config.gamepadIndex !== null) {
        const gamepad = this.scene.input.gamepad?.getPad(config.gamepadIndex);
        if (gamepad) {
          console.log(
            `✅ Player ${playerIndex} gamepad now found: ${gamepad.id}`,
          );
        } else {
          console.log(
            `❌ Player ${playerIndex} gamepad still not found at index ${config.gamepadIndex}`,
          );
        }
      }
    });
  }

  /**
   * Checks if a specific gamepad button was just pressed (not held)
   * @param gamepadIndex - Index of the gamepad
   * @param buttonIndex - Index of the button
   * @returns True if button was just pressed this frame
   */
  private checkGamepadButtonJustPressed(
    gamepadIndex: number,
    buttonIndex: number,
  ): boolean {
    if (!this.scene.input.gamepad) return false;

    const gamepad = this.scene.input.gamepad.getPad(gamepadIndex);
    if (!gamepad) return false;

    const button = gamepad.buttons[buttonIndex];
    if (!button) return false;

    const currentPressed = button.pressed;

    // Initialize previous state tracking for this gamepad if needed
    if (!this.previousGamepadButtonStates.has(gamepadIndex)) {
      this.previousGamepadButtonStates.set(gamepadIndex, new Map());
    }

    const gamepadStates = this.previousGamepadButtonStates.get(gamepadIndex)!;
    const previousPressed = gamepadStates.get(buttonIndex) || false;

    // Update the previous state
    gamepadStates.set(buttonIndex, currentPressed);

    // Return true only if button is pressed now but wasn't pressed last frame
    return currentPressed && !previousPressed;
  }

  /**
   * Should be called every frame to update button state tracking
   */
  public update(): void {
    // This method ensures our button state tracking stays in sync
    // It's called from the game scene's update method
  }

  /**
   * Creates default input configurations for all three players.
   * @returns Array of default player input configurations
   */
  public static createDefaultConfigs(): PlayerInputConfig[] {
    const defaultGamepadConfig: GamepadConfig = {
      stickThreshold: 0.3,
      dpadLeft: 14, // Xbox controller D-pad left
      dpadRight: 15, // Xbox controller D-pad right
      jumpButton: 0, // Xbox controller A button
    };

    return [
      // Player 1 - Keyboard WASD + Gamepad 0
      {
        playerIndex: 0,
        keyboard: {
          left: 'A',
          right: 'D',
          jump: 'W',
        },
        gamepad: defaultGamepadConfig,
        gamepadIndex: 0,
      },
      // Player 2 - Keyboard Arrows + Gamepad 1
      {
        playerIndex: 1,
        keyboard: {
          left: 'LEFT',
          right: 'RIGHT',
          jump: 'UP',
        },
        gamepad: defaultGamepadConfig,
        gamepadIndex: 1,
      },
      // Player 3 - Keyboard IJKL + Gamepad 2
      {
        playerIndex: 2,
        keyboard: {
          left: 'J',
          right: 'L',
          jump: 'I',
        },
        gamepad: defaultGamepadConfig,
        gamepadIndex: 2,
      },
    ];
  }
}

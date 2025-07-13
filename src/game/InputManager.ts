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
    // Enable gamepad support (check if available first)
    if (this.scene.input.gamepad) {
      // Listen for gamepad connection events
      this.scene.input.gamepad.on(
        'connected',
        (pad: Phaser.Input.Gamepad.Gamepad) => {
          console.log(`Gamepad connected: ${pad.id} (index: ${pad.index})`);
        },
      );

      this.scene.input.gamepad.on(
        'disconnected',
        (pad: Phaser.Input.Gamepad.Gamepad) => {
          console.log(`Gamepad disconnected: ${pad.id} (index: ${pad.index})`);
        },
      );
    }
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
    if (!this.scene.input.gamepad) return false;
    const gamepad = this.scene.input.gamepad.getPad(config.gamepadIndex!);
    if (!gamepad) return false;

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
        // Check if jump button was just pressed
        const jumpButton = gamepad.buttons[config.gamepad.jumpButton];
        // For gamepad, we'll use the pressed state (Phaser handles justDown internally)
        return jumpButton ? jumpButton.pressed : false;

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

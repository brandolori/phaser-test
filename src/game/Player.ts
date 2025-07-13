import { Scene, Physics } from 'phaser';
import { GameSettings } from './GameSettings';
import { InputManager, GameAction } from './InputManager';

/**
 * Interface defining the player configuration
 */
interface PlayerConfig {
  /** Player index for input management */
  playerIndex: number;
  /** Color tint for the player sprite */
  color: number;
}

/**
 * Player class representing a controllable toaster character.
 * Extends Phaser's Arcade Sprite with custom movement and jumping mechanics.
 * Now supports both keyboard and gamepad input through InputManager.
 */
export class Player extends Physics.Arcade.Sprite {
  /** Reference to game settings singleton */
  private settings: GameSettings;
  /** Number of jumps remaining before needing to touch ground */
  private jumpsLeft: number = 2;
  /** Whether the player is currently touching the ground */
  private isGrounded: boolean = false;
  /** Player configuration including input index */
  private config: PlayerConfig;
  /** Reference to input manager for unified input handling */
  private inputManager: InputManager;

  /**
   * Creates a new Player instance with physics body and input handling.
   * @param scene - The Phaser scene to add this player to
   * @param x - Initial X position in pixels
   * @param y - Initial Y position in pixels
   * @param texture - Texture key for the player sprite
   * @param config - Player configuration including input index
   * @param inputManager - Input manager for handling controls
   */
  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    config: PlayerConfig,
    inputManager: InputManager,
  ) {
    super(scene, x, y, texture);

    this.settings = GameSettings.getInstance();
    this.config = config;
    this.inputManager = inputManager;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Apply sprite scaling
    // this.setScale(this.settings.spriteScale);

    const body = this.body as Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    // Scale collision box accordingly
    body.setSize(
      128 / this.settings.spriteScale,
      64 / this.settings.spriteScale,
    );

    this.scale = this.settings.spriteScale;
    body.pushable = true;
    body.setDrag(this.settings.pushDrag, 0);

    this.setTint(config.color);
  }

  /**
   * Updates the player's state each frame.
   * Handles ground detection, movement, jumping, and jump reset.
   */
  update(): void {
    this.checkGrounded();
    this.handleMovement();
    this.handleJumping();

    if (this.isGrounded) {
      this.jumpsLeft = 2;
    }
  }

  /**
   * Checks if the player is currently touching the ground.
   * Updates the isGrounded flag based on physics body collision state.
   */
  private checkGrounded(): void {
    const body = this.body as Physics.Arcade.Body;
    this.isGrounded = body.blocked.down || body.touching.down;
  }

  /**
   * Handles horizontal movement based on input.
   * Applies different speeds for ground vs air movement.
   * Also handles sprite flipping for visual direction indication.
   * Now supports both keyboard and gamepad input.
   */
  private handleMovement(): void {
    const body = this.body as Physics.Arcade.Body;
    let speed = this.isGrounded
      ? this.settings.runSpeed
      : this.settings.airSpeed;

    if (
      this.inputManager.isActionActive(GameAction.LEFT, this.config.playerIndex)
    ) {
      body.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (
      this.inputManager.isActionActive(
        GameAction.RIGHT,
        this.config.playerIndex,
      )
    ) {
      body.setVelocityX(speed);
      this.setFlipX(false);
    } else if (this.isGrounded) {
      body.setVelocityX(0);
    }
  }

  /**
   * Handles jumping mechanics including double-jump.
   * Applies different impulses for first jump vs double jump.
   * Decrements available jumps when used.
   * Now supports both keyboard and gamepad input.
   */
  private handleJumping(): void {
    const body = this.body as Physics.Arcade.Body;

    if (
      this.inputManager.wasActionJustPressed(
        GameAction.JUMP,
        this.config.playerIndex,
      ) &&
      this.jumpsLeft > 0
    ) {
      const impulse =
        this.jumpsLeft === 2
          ? this.settings.jumpImpulse
          : this.settings.doubleJumpImpulse;
      body.setVelocityY(-impulse);
      this.jumpsLeft--;
    }
  }

  /**
   * Gets the player configuration.
   * @returns The PlayerConfig object containing player index and color
   */
  public getConfig(): PlayerConfig {
    return this.config;
  }

  /**
   * Gets the player index for input management.
   * @returns The player index
   */
  public getPlayerIndex(): number {
    return this.config.playerIndex;
  }
}

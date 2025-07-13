import { Scene, Physics } from 'phaser';
import { GameSettings } from './GameSettings';

/**
 * Interface defining the control scheme for a player
 */
interface PlayerControls {
  /** Key for moving left */
  left: Phaser.Input.Keyboard.Key;
  /** Key for moving right */
  right: Phaser.Input.Keyboard.Key;
  /** Key for jumping */
  jump: Phaser.Input.Keyboard.Key;
  /** Color tint for the player sprite */
  color: number;
}

/**
 * Player class representing a controllable toaster character.
 * Extends Phaser's Arcade Sprite with custom movement and jumping mechanics.
 */
export class Player extends Physics.Arcade.Sprite {
  /** Reference to game settings singleton */
  private settings: GameSettings;
  /** Number of jumps remaining before needing to touch ground */
  private jumpsLeft: number = 2;
  /** Whether the player is currently touching the ground */
  private isGrounded: boolean = false;
  /** Control scheme configuration for this player */
  private controls: PlayerControls;

  /**
   * Creates a new Player instance with physics body and controls.
   * @param scene - The Phaser scene to add this player to
   * @param x - Initial X position in pixels
   * @param y - Initial Y position in pixels
   * @param texture - Texture key for the player sprite
   * @param controls - Control configuration for this player
   */
  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    controls: PlayerControls,
  ) {
    super(scene, x, y, texture);

    this.settings = GameSettings.getInstance();
    this.controls = controls;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    body.setSize(32, 48);
    body.setOffset(16, 16);
    body.pushable = true;
    body.setDrag(this.settings.pushDrag, 0);

    this.setTint(controls.color);
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
   */
  private handleMovement(): void {
    const body = this.body as Physics.Arcade.Body;
    let speed = this.isGrounded
      ? this.settings.runSpeed
      : this.settings.airSpeed;

    if (this.controls.left.isDown) {
      body.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (this.controls.right.isDown) {
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
   */
  private handleJumping(): void {
    const body = this.body as Physics.Arcade.Body;

    if (
      Phaser.Input.Keyboard.JustDown(this.controls.jump) &&
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
   * Gets the control configuration for this player.
   * @returns The PlayerControls object containing key bindings and color
   */
  public getControls() {
    return this.controls;
  }
}

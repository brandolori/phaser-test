import { Scene, Physics } from 'phaser';
import { Player } from './Player';
import { GameSettings } from './GameSettings';

/**
 * Toast class implementing the "Hot-Potato" mechanic.
 * Alternates ownership between players with timed ejection system.
 */
export class Toast extends Physics.Arcade.Sprite {
  /** Reference to game settings singleton */
  private settings: GameSettings;
  /** Current owner of the toast, null when flying */
  private currentOwner: Player | null = null;
  /** Time remaining before automatic ejection in seconds */
  private remainingTime: number = 0;
  /** Player who last owned the toast (for alternation enforcement) */
  private lastOwner: Player | null = null;
  /** Last pickup time for cooldown mechanism */
  private lastPickupTime: number = 0;
  /** Flag to track if position needs updating */
  private positionDirty: boolean = true;
  /** Reference to player1 for reset functionality */
  private player1Ref: Player | null = null;

  /**
   * Creates a new Toast instance.
   * @param scene - The Phaser scene to add this toast to
   * @param x - Initial X position in pixels
   * @param y - Initial Y position in pixels
   * @param texture - Texture key for the toast sprite
   */
  constructor(scene: Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    this.settings = GameSettings.getInstance();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Physics.Arcade.Body;
    if (!body) {
      console.error('Toast: Failed to create physics body');
      return;
    }

    body.setCollideWorldBounds(false);
    body.setSize(
      this.settings.toastCollisionWidth,
      this.settings.toastCollisionHeight,
    );
    body.setOffset(
      this.settings.toastCollisionOffsetX,
      this.settings.toastCollisionOffsetY,
    );
    body.setGravityY(this.settings.gravityY);

    // Start disabled (will be enabled when ejected)
    body.enable = false;
  }

  /**
   * Updates the toast state each frame.
   * Handles countdown timer, positioning when owned, and ejection logic.
   * @param delta - Time elapsed since last frame in milliseconds
   */
  update(delta: number): void {
    if (this.currentOwner) {
      this.updateOwnershipState(delta);
    }
    this.checkWorldBounds();
  }

  /**
   * Updates the toast when it has an owner.
   * Handles positioning, countdown, and automatic ejection.
   * @param delta - Time elapsed since last frame in milliseconds
   */
  private updateOwnershipState(delta: number): void {
    if (!this.currentOwner) return;

    // Only update position if needed (optimization)
    const newX = this.currentOwner.x;
    const newY = this.currentOwner.y - this.settings.toastOffsetY;

    if (
      this.positionDirty ||
      Math.abs(this.x - newX) > 0.1 ||
      Math.abs(this.y - newY) > 0.1
    ) {
      this.setPosition(newX, newY);
      this.positionDirty = false;
    }

    // Update countdown timer
    this.remainingTime -= delta / 1000;

    // Check for automatic ejection
    if (this.remainingTime <= 0) {
      this.ejectFromOwner();
    }
  }

  /**
   * Ejects the toast from its current owner.
   * Enables physics, applies launch velocity, and clears ownership.
   */
  private ejectFromOwner(): void {
    if (!this.currentOwner) return;

    const body = this.body as Physics.Arcade.Body;
    const ownerBody = this.currentOwner.body as Physics.Arcade.Body;

    if (!body || !ownerBody) {
      console.error('Toast: Missing physics body during ejection');
      return;
    }

    // Store last owner for alternation rule
    this.lastOwner = this.currentOwner;

    // Enable physics and gravity
    body.enable = true;

    // Position at owner location
    this.setPosition(
      this.currentOwner.x,
      this.currentOwner.y - this.settings.toastOffsetY,
    );

    // Apply launch velocity (inherit owner's horizontal velocity + upward impulse)
    body.setVelocityX(ownerBody.velocity.x);
    body.setVelocityY(-this.settings.ejectImpulseY);

    // Clear ownership
    this.currentOwner = null;
    this.remainingTime = 0;
    this.positionDirty = true;
  }

  /**
   * Attempts to assign ownership of the toast to a player.
   * Enforces alternation rule (last owner cannot immediately reclaim).
   * @param player - The player attempting to pick up the toast
   * @returns True if pickup was successful, false otherwise
   */
  public pickupBy(player: Player): boolean {
    // Check cooldown
    const currentTime = Date.now();
    if (currentTime - this.lastPickupTime < this.settings.pickupCooldownMs) {
      return false;
    }

    // Enforce alternation rule - last owner cannot pick up immediately
    if (this.lastOwner === player) {
      return false;
    }

    // Disable physics body and gravity
    const body = this.body as Physics.Arcade.Body;
    if (!body) {
      console.error('Toast: Missing physics body during pickup');
      return false;
    }

    body.enable = false;

    // Set new owner and reset timer
    this.currentOwner = player;
    this.remainingTime = this.settings.timeToEject;
    this.lastPickupTime = currentTime;
    this.positionDirty = true;

    // Position immediately above new owner
    this.setPosition(player.x, player.y - this.settings.toastOffsetY);

    return true;
  }

  /**
   * Resets the toast to its initial state on Player 1.
   * Called when toast hits the ground or needs to restart.
   * @param player1 - The first player who should receive the toast
   */
  public resetToPlayer1(player1: Player): void {
    if (!player1) {
      console.error('Toast: Cannot reset to null player1');
      return;
    }

    // Store player1 reference for world bounds reset
    this.player1Ref = player1;

    // Clear ownership history and cooldown
    this.lastOwner = null;
    this.lastPickupTime = 0;
    this.positionDirty = true;

    // Assign to Player 1
    this.pickupBy(player1);
  }

  /**
   * Handles collision with the ground or world bounds.
   * Triggers a reset to Player 1.
   * @param player1 - The first player who should receive the toast after reset
   */
  public handleGroundHit(player1: Player): void {
    this.resetToPlayer1(player1);
  }

  /**
   * Gets the current owner of the toast.
   * @returns The current owner player, or null if toast is flying
   */
  public getCurrentOwner(): Player | null {
    return this.currentOwner;
  }

  /**
   * Gets the remaining time before ejection.
   * @returns Time remaining in seconds, or 0 if not owned
   */
  public getRemainingTime(): number {
    return this.currentOwner ? this.remainingTime : 0;
  }

  /**
   * Checks if the toast is currently owned by any player.
   * @returns True if toast is owned, false if flying
   */
  public isOwned(): boolean {
    return this.currentOwner !== null;
  }

  /**
   * Checks if the toast can be picked up by the specified player.
   * @param player - The player attempting pickup
   * @returns True if pickup is allowed, false if blocked by alternation rule
   */
  public canBePickedUpBy(player: Player): boolean {
    return this.lastOwner !== player;
  }

  /**
   * Checks if toast is outside world bounds and resets if needed.
   * Handles the case where toast flies out of the level.
   */
  private checkWorldBounds(): void {
    if (this.currentOwner) return; // Only check when flying

    const worldBounds = this.scene.physics.world.bounds;
    const buffer = 50; // Extra buffer beyond world bounds

    if (
      this.x < worldBounds.x - buffer ||
      this.x > worldBounds.x + worldBounds.width + buffer ||
      this.y < worldBounds.y - buffer ||
      this.y > worldBounds.y + worldBounds.height + buffer
    ) {
      if (this.player1Ref) {
        this.resetToPlayer1(this.player1Ref);
      }
    }
  }
}

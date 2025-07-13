/**
 * Singleton class that manages all configurable game parameters.
 * Provides centralized access to physics, movement, and level settings.
 */
export class GameSettings {
  /** Downward gravity acceleration in pixels per second squared */
  public gravityY: number = 800;

  /** Player movement speed when on ground in pixels per second */
  public runSpeed: number = 220;

  /** Player movement speed when airborne in pixels per second */
  public airSpeed: number = 180;

  /** Initial jump velocity impulse in pixels per second */
  public jumpImpulse: number = 380;

  /** Second jump velocity impulse in pixels per second */
  public doubleJumpImpulse: number = 320;

  /** Horizontal drag force applied to players in pixels per second */
  public pushDrag: number = 50;

  /** Total level width in pixels */
  public levelWidth: number = 2048;

  /** Total level height in pixels */
  public levelHeight: number = 768;

  /** Time in seconds a player can hold toast before auto-eject */
  public timeToEject: number = 3.0;

  /** Upward velocity applied when toast is ejected in pixels per second */
  public ejectImpulseY: number = 1000;

  /** Vertical offset of toast sprite above owner in pixels */
  public toastOffsetY: number = 8;

  /** Toast collision box width in pixels */
  public toastCollisionWidth: number = 24;

  /** Toast collision box height in pixels */
  public toastCollisionHeight: number = 16;

  /** Toast collision box X offset in pixels */
  public toastCollisionOffsetX: number = 4;

  /** Toast collision box Y offset in pixels */
  public toastCollisionOffsetY: number = 8;

  /** Pickup cooldown duration in milliseconds */
  public pickupCooldownMs: number = 100;

  /** Singleton instance holder */
  private static _instance: GameSettings;

  /**
   * Gets the singleton instance of GameSettings.
   * Creates a new instance if one doesn't exist.
   * @returns The singleton GameSettings instance
   */
  public static getInstance(): GameSettings {
    if (!this._instance) {
      this._instance = new GameSettings();
    }
    return this._instance;
  }

  /**
   * Private constructor to prevent direct instantiation.
   * Use getInstance() to access the singleton instance.
   */
  private constructor() {}
}

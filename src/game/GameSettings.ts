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

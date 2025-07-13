import { Scene, Physics } from 'phaser';
import { Player } from './Player';
import { Toast } from './Toast';
import { GameStats } from './GameStats';

/**
 * Interface for toast timer display information
 */
export interface ToastTimerInfo {
  /** Toast ID for identification */
  id: string;
  /** Whether the toast is currently owned */
  isOwned: boolean;
  /** Current owner player or null */
  owner: Player | null;
  /** Owner name for display */
  ownerName: string;
  /** Remaining time in seconds */
  remainingTime: number;
}

/**
 * ToastManager handles multiple toast instances in the game.
 * Manages creation, updates, collisions, and provides unified interface
 * for multiple hot-potato mechanics running simultaneously.
 */
export class ToastManager {
  /** Reference to the Phaser scene */
  private scene: Scene;
  /** Map of toast instances by ID */
  private toasts: Map<string, Toast> = new Map();
  /** Array of all players for reset functionality */
  private players: Player[] = [];
  /** Reference to ground platform for collision */
  private groundPlatform: Physics.Arcade.Sprite | null = null;
  /** Game statistics tracker */
  private gameStats: GameStats;

  /**
   * Creates a new ToastManager instance.
   * @param scene - The Phaser scene to manage toasts in
   */
  constructor(scene: Scene) {
    this.scene = scene;
    this.gameStats = GameStats.getInstance();
  }

  /**
   * Sets the players array for toast management.
   * @param players - Array of all players in the game
   */
  public setPlayers(players: Player[]): void {
    this.players = players;
  }

  /**
   * Sets the ground platform for collision detection.
   * @param groundPlatform - The ground platform sprite
   */
  public setGroundPlatform(groundPlatform: Physics.Arcade.Sprite | null): void {
    this.groundPlatform = groundPlatform;
  }

  /**
   * Creates a new toast with the specified ID and texture.
   * @param id - Unique identifier for the toast
   * @param texture - Texture key for the toast sprite
   * @param initialOwner - Player who should initially own this toast
   * @returns The created Toast instance
   */
  public createToast(id: string, texture: string, initialOwner: Player): Toast {
    const toast = new Toast(this.scene, 0, 0, texture, id);
    this.toasts.set(id, toast);

    // Initialize with the specified owner
    toast.resetToPlayer1(initialOwner);

    return toast;
  }

  /**
   * Gets a toast by its ID.
   * @param id - The toast ID to retrieve
   * @returns The Toast instance or undefined if not found
   */
  public getToast(id: string): Toast | undefined {
    return this.toasts.get(id);
  }

  /**
   * Gets all toast instances.
   * @returns Array of all Toast instances
   */
  public getAllToasts(): Toast[] {
    return Array.from(this.toasts.values());
  }

  /**
   * Updates all toasts each frame.
   * @param delta - Time elapsed since last frame in milliseconds
   */
  public update(delta: number): void {
    for (const toast of this.toasts.values()) {
      toast.update(delta);
    }
  }

  /**
   * Sets up collision detection for all toasts with ground platform.
   * Should be called after ground platform is available.
   */
  public setupGroundCollisions(): void {
    if (!this.groundPlatform) return;

    for (const toast of this.toasts.values()) {
      this.scene.physics.add.collider(toast, this.groundPlatform, () => {
        // Reset to Player 1 (first player in array)
        if (this.players.length > 0) {
          toast.handleGroundHit(this.players[0]);
        }
      });
    }
  }

  /**
   * Sets up overlap detection for all toasts with all players.
   * Should be called after all players are created.
   */
  public setupPlayerOverlaps(): void {
    for (const toast of this.toasts.values()) {
      for (const player of this.players) {
        this.scene.physics.add.overlap(toast, player, () => {
          if (
            !toast.isOwned() &&
            toast.canBePickedUpBy(player) &&
            this.canPlayerPickupToast(player)
          ) {
            toast.pickupBy(player);
          }
        });
      }
    }
  }

  /**
   * Gets timer information for all toasts for UI display.
   * @returns Array of timer information for each toast
   */
  public getTimerInfo(): ToastTimerInfo[] {
    const timerInfo: ToastTimerInfo[] = [];

    for (const [id, toast] of this.toasts) {
      const owner = toast.getCurrentOwner();
      let ownerName = 'Flying';

      if (owner) {
        const ownerIndex = this.players.findIndex((p) => p === owner);
        ownerName = ownerIndex >= 0 ? `Player ${ownerIndex + 1}` : 'Unknown';
      }

      timerInfo.push({
        id,
        isOwned: toast.isOwned(),
        owner,
        ownerName,
        remainingTime: toast.getRemainingTime(),
      });
    }

    return timerInfo;
  }

  /**
   * Removes a toast from management.
   * @param id - The toast ID to remove
   */
  public removeToast(id: string): void {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.destroy();
      this.toasts.delete(id);
    }
  }

  /**
   * Removes all toasts from management.
   */
  public removeAllToasts(): void {
    for (const toast of this.toasts.values()) {
      toast.destroy();
    }
    this.toasts.clear();
  }

  /**
   * Gets all toast instances for collision setup.
   * @returns Array of all toast instances
   */
  public getAllToasts(): Toast[] {
    return Array.from(this.toasts.values());
  }

  /**
   * Checks if a player can pick up a toast (max 1 toast per player).
   * @param player - The player attempting to pick up a toast
   * @returns True if the player doesn't already own a toast
   */
  private canPlayerPickupToast(player: Player): boolean {
    for (const toast of this.toasts.values()) {
      if (toast.getCurrentOwner() === player) {
        return false; // Player already owns a toast
      }
    }
    return true; // Player doesn't own any toast
  }

  /**
   * Gets the number of toasts currently managed.
   * @returns Number of active toasts
   */
  public getToastCount(): number {
    return this.toasts.size;
  }
}

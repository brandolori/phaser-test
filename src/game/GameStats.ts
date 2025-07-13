/**
 * Interface for game statistics
 */
export interface GameStatistics {
  /** Total game duration in milliseconds */
  gameDurationMs: number;
  /** Number of toast passes between players */
  toastPasses: number;
  /** Start time of the current round */
  roundStartTime: number;
  /** Number of times each player had a toast */
  playerToastCounts: Map<string, number>;
  /** Longest time a single player held a toast (in seconds) */
  longestHoldTime: number;
  /** Total number of toast ejections */
  totalEjections: number;
}

/**
 * GameStats manages game statistics and performance tracking.
 * Tracks toast passes, game duration, and player performance metrics.
 */
export class GameStats {
  private stats: GameStatistics;
  private static instance: GameStats;

  /**
   * Creates a new GameStats instance.
   */
  private constructor() {
    this.stats = this.createDefaultStats();
  }

  /**
   * Gets the singleton instance of GameStats.
   */
  public static getInstance(): GameStats {
    if (!GameStats.instance) {
      GameStats.instance = new GameStats();
    }
    return GameStats.instance;
  }

  /**
   * Creates default statistics object.
   */
  private createDefaultStats(): GameStatistics {
    return {
      gameDurationMs: 0,
      toastPasses: 0,
      roundStartTime: Date.now(),
      playerToastCounts: new Map(),
      longestHoldTime: 0,
      totalEjections: 0,
    };
  }

  /**
   * Starts a new round, resetting all statistics.
   */
  public startNewRound(): void {
    this.stats = this.createDefaultStats();
    console.log('🎮 New round started - stats reset');
  }

  /**
   * Records a toast pass between players.
   * @param fromPlayer - Player who passed the toast (or null if ejected)
   * @param toPlayer - Player who received the toast
   * @param holdTimeSeconds - How long the previous player held the toast
   */
  public recordToastPass(
    fromPlayer: string | null,
    toPlayer: string,
    holdTimeSeconds: number,
  ): void {
    this.stats.toastPasses++;

    // Update player toast count
    const currentCount = this.stats.playerToastCounts.get(toPlayer) || 0;
    this.stats.playerToastCounts.set(toPlayer, currentCount + 1);

    // Update longest hold time
    if (holdTimeSeconds > this.stats.longestHoldTime) {
      this.stats.longestHoldTime = holdTimeSeconds;
    }

    console.log(
      `📊 Toast pass recorded: ${fromPlayer || 'AUTO'} → ${toPlayer} (held for ${holdTimeSeconds.toFixed(1)}s)`,
    );
  }

  /**
   * Records a toast ejection (automatic timeout).
   * @param player - Player who had the toast ejected
   * @param holdTimeSeconds - How long the player held the toast
   */
  public recordToastEjection(player: string, holdTimeSeconds: number): void {
    this.stats.totalEjections++;

    // Update longest hold time
    if (holdTimeSeconds > this.stats.longestHoldTime) {
      this.stats.longestHoldTime = holdTimeSeconds;
    }

    console.log(
      `💥 Toast ejection recorded: ${player} (held for ${holdTimeSeconds.toFixed(1)}s)`,
    );
  }

  /**
   * Ends the current round and calculates final statistics.
   */
  public endRound(): void {
    this.stats.gameDurationMs = Date.now() - this.stats.roundStartTime;
    console.log('🏁 Round ended - final stats calculated');
  }

  /**
   * Gets the current game statistics.
   */
  public getStats(): GameStatistics {
    // Update duration to current time
    this.stats.gameDurationMs = Date.now() - this.stats.roundStartTime;
    return { ...this.stats };
  }

  /**
   * Formats game duration as a readable string.
   * @param durationMs - Duration in milliseconds
   * @returns Formatted duration string (e.g., "2:34" or "1:23:45")
   */
  public static formatDuration(durationMs: number): string {
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Gets formatted statistics for display.
   */
  public getFormattedStats(): {
    duration: string;
    passes: number;
    ejections: number;
    longestHold: string;
    playerStats: Array<{ player: string; count: number }>;
  } {
    const stats = this.getStats();

    return {
      duration: GameStats.formatDuration(stats.gameDurationMs),
      passes: stats.toastPasses,
      ejections: stats.totalEjections,
      longestHold: `${stats.longestHoldTime.toFixed(1)}s`,
      playerStats: Array.from(stats.playerToastCounts.entries())
        .map(([player, count]) => ({ player, count }))
        .sort((a, b) => b.count - a.count),
    };
  }
}

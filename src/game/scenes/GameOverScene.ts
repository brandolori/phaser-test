import { Scene } from 'phaser';
import { GameStats } from '../GameStats';

/**
 * GameOverScene displays game over information and statistics.
 * Shows round duration, toast passes, and performance metrics.
 */
export class GameOverScene extends Scene {
  private gameStats: GameStats;
  private restartText!: Phaser.GameObjects.Text;

  /**
   * Creates the GameOverScene.
   */
  constructor() {
    super({ key: 'GameOverScene' });
    this.gameStats = GameStats.getInstance();
  }

  /**
   * Creates the game over interface with statistics.
   */
  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // End the current round to calculate final stats
    this.gameStats.endRound();
    const stats = this.gameStats.getFormattedStats();

    // Create background
    this.createBackground();

    // Title
    this.add
      .text(centerX, 80, 'ROUND COMPLETE!', {
        fontFamily: 'monospace',
        fontSize: '42px',
        color: '#FF6B35',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5);

    // Statistics panel
    this.createStatisticsPanel(centerX, centerY, stats);

    // Restart instructions
    this.restartText = this.add
      .text(
        centerX,
        this.cameras.main.height - 100,
        'PRESS SPACE TO PLAY AGAIN\\nPRESS ESC FOR MAIN MENU',
        {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#00FF00',
          stroke: '#000000',
          strokeThickness: 2,
          align: 'center',
        },
      )
      .setOrigin(0.5);

    // Blinking animation
    this.tweens.add({
      targets: this.restartText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Setup input handlers
    this.setupInputHandlers();

    // Achievement/milestone checking
    this.checkAchievements(stats);
  }

  /**
   * Creates the background with darker theme for game over.
   */
  private createBackground(): void {
    // Dark gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x2c0e37, 0x2c0e37, 0x0f0a0a, 0x0f0a0a);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Add some particle effects
    this.createParticleEffects();
  }

  /**
   * Creates particle effects for visual appeal.
   */
  private createParticleEffects(): void {
    // Create floating particles
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);

      const particle = this.add.circle(x, y, 2, 0xffd700, 0.6);

      // Floating animation
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(100, 300),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        ease: 'Power2',
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  /**
   * Creates the statistics panel showing game performance.
   */
  private createStatisticsPanel(
    centerX: number,
    centerY: number,
    stats: {
      duration: string;
      passes: number;
      ejections: number;
      longestHold: string;
      playerStats: Array<{ player: string; count: number }>;
    },
  ): void {
    // Panel background
    const panelWidth = 500;
    const panelHeight = 300;
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.8);
    panel.fillRoundedRect(
      centerX - panelWidth / 2,
      centerY - panelHeight / 2,
      panelWidth,
      panelHeight,
      10,
    );
    panel.lineStyle(3, 0xffd700, 1);
    panel.strokeRoundedRect(
      centerX - panelWidth / 2,
      centerY - panelHeight / 2,
      panelWidth,
      panelHeight,
      10,
    );

    // Statistics title
    this.add
      .text(centerX, centerY - 120, '📊 ROUND STATISTICS', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5);

    // Main stats
    const mainStatsText = `⏱️ Round Duration: ${stats.duration}
🍞 Toast Passes: ${stats.passes}
💥 Auto-Ejections: ${stats.ejections}
🏆 Longest Hold: ${stats.longestHold}`;

    this.add
      .text(centerX, centerY - 60, mainStatsText, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 1,
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    // Player statistics
    if (stats.playerStats.length > 0) {
      this.add
        .text(centerX, centerY + 30, '👥 PLAYER PERFORMANCE', {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#4ECDC4',
          stroke: '#000000',
          strokeThickness: 1,
          align: 'center',
        })
        .setOrigin(0.5);

      let playerStatsText = '';
      stats.playerStats.forEach(
        (playerStat: { player: string; count: number }, index: number) => {
          const playerNames = ['Gold Player', 'Teal Player', 'Purple Player'];
          const emoji = ['🥇', '🥈', '🥉'][index] || '🏅';
          playerStatsText += `${emoji} ${playerNames[parseInt(playerStat.player)] || `Player ${playerStat.player}`}: ${playerStat.count} toasts\\n`;
        },
      );

      this.add
        .text(centerX, centerY + 65, playerStatsText, {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 1,
          align: 'center',
          lineSpacing: 4,
        })
        .setOrigin(0.5);
    }
  }

  /**
   * Checks for achievements and milestones.
   */
  private checkAchievements(stats: {
    duration: string;
    passes: number;
    ejections: number;
    longestHold: string;
  }): void {
    const achievements = [];

    // Check various achievements
    if (stats.passes >= 50) {
      achievements.push('🎯 Toast Master: 50+ passes!');
    } else if (stats.passes >= 25) {
      achievements.push('🍞 Toast Expert: 25+ passes!');
    } else if (stats.passes >= 10) {
      achievements.push('🎮 Getting the Hang of It: 10+ passes!');
    }

    if (
      stats.duration.includes(':') &&
      parseInt(stats.duration.split(':')[0]) >= 5
    ) {
      achievements.push('⏰ Marathon Player: 5+ minutes!');
    }

    if (stats.ejections === 0 && stats.passes > 5) {
      achievements.push('🎯 Perfect Game: No ejections!');
    }

    if (parseFloat(stats.longestHold) >= 2.9) {
      achievements.push('😅 Close Call: Almost timed out!');
    }

    // Display achievements if any
    if (achievements.length > 0) {
      const achievementText = achievements.join('\\n');
      this.add
        .text(
          this.cameras.main.width - 10,
          80,
          `🏆 ACHIEVEMENTS\\n\\n${achievementText}`,
          {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'right',
            lineSpacing: 4,
          },
        )
        .setOrigin(1, 0);
    }
  }

  /**
   * Sets up input handlers for restarting or returning to menu.
   */
  private setupInputHandlers(): void {
    // Restart game
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.restartGame();
    });

    // Return to menu
    this.input.keyboard?.once('keydown-ESC', () => {
      this.returnToMenu();
    });

    // Gamepad support
    this.input.gamepad?.on(
      'down',
      (_pad: unknown, button: { index: number }) => {
        if (button.index === 0) {
          // A button - restart
          this.restartGame();
        } else if (button.index === 1) {
          // B button - menu
          this.returnToMenu();
        }
      },
    );

    // Mouse/touch - restart on click
    this.input.once('pointerdown', () => {
      this.restartGame();
    });
  }

  /**
   * Restarts the game.
   */
  private restartGame(): void {
    // Play sound effect
    try {
      this.sound.play('bell', { volume: 0.3 });
    } catch {
      // Sound not available
    }

    // Start new round
    this.gameStats.startNewRound();
    this.scene.start('Game');
  }

  /**
   * Returns to the main menu.
   */
  private returnToMenu(): void {
    this.scene.start('MenuScene');
  }
}

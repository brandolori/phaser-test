import { Scene, Physics } from 'phaser';
import { GameSettings } from './GameSettings';

/**
 * Configuration interface for level building
 */
export interface LevelConfig {
  /** Level width in pixels */
  width: number;
  /** Level height in pixels */
  height: number;
  /** Background texture key */
  backgroundTexture: string;
  /** Platform configurations */
  platforms: PlatformConfig[];
}

/**
 * Configuration for individual platforms
 */
export interface PlatformConfig {
  /** X position */
  x: number;
  /** Y position */
  y: number;
  /** Width scale multiplier (optional, defaults to 1) */
  scaleX?: number;
  /** Height scale multiplier (optional, defaults to 1) */
  scaleY?: number;
  /** Whether this is the ground platform */
  isGround?: boolean;
}

/**
 * Level builder responsible for constructing game levels.
 * Handles background, platforms, and world boundaries setup.
 * Follows Single Responsibility Principle by separating level construction
 * from game scene orchestration.
 */
export class LevelBuilder {
  private scene: Scene;
  private platforms!: Physics.Arcade.StaticGroup;

  /**
   * Creates a new LevelBuilder instance.
   * @param scene - The Phaser scene to build the level in
   */
  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Builds a complete level based on the provided configuration.
   * @param config - Level configuration defining layout and assets
   * @returns The created platforms group for collision setup
   */
  public build(config: LevelConfig): Physics.Arcade.StaticGroup {
    this.createBackground(config);
    this.createPlatformTexture();
    this.createPlatforms(config.platforms);
    this.setupWorldBounds(config);

    return this.platforms;
  }

  /**
   * Creates and positions the background image.
   * @param config - Level configuration containing background settings
   */
  private createBackground(config: LevelConfig): void {
    this.scene.add
      .image(config.width / 2, config.height / 2, config.backgroundTexture)
      .setDisplaySize(config.width, config.height);
  }

  /**
   * Generates the procedural platform texture.
   * Creates a brown rectangular texture for all platforms.
   */
  private createPlatformTexture(): void {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x8b4513);
    graphics.fillRect(0, 0, 200, 32);
    graphics.generateTexture('platform', 200, 32);
    graphics.destroy();
  }

  /**
   * Creates all platforms based on the configuration array.
   * @param platformConfigs - Array of platform configurations
   */
  private createPlatforms(platformConfigs: PlatformConfig[]): void {
    this.platforms = this.scene.physics.add.staticGroup();

    platformConfigs.forEach((platformConfig) => {
      const platform = this.platforms.create(
        platformConfig.x,
        platformConfig.y,
        'platform',
      );

      // Apply scaling if specified
      if (platformConfig.scaleX || platformConfig.scaleY) {
        platform.setScale(
          platformConfig.scaleX || 1,
          platformConfig.scaleY || 1,
        );
        platform.refreshBody();
      }

      // Tag ground platform for special collision handling
      if (platformConfig.isGround) {
        platform.setData('isGround', true);
      }
    });
  }

  /**
   * Sets up world physics boundaries.
   * @param config - Level configuration containing dimensions
   */
  private setupWorldBounds(config: LevelConfig): void {
    this.scene.physics.world.setBounds(0, 0, config.width, config.height);
  }

  /**
   * Gets the ground platform from the created platforms.
   * @returns The ground platform or null if not found
   */
  public getGroundPlatform(): Physics.Arcade.Sprite | null {
    const groundPlatform = this.platforms.children.entries.find((platform) =>
      (platform as Physics.Arcade.Sprite).getData('isGround'),
    );

    return (groundPlatform as Physics.Arcade.Sprite) || null;
  }

  /**
   * Gets all created platforms.
   * @returns The platforms group
   */
  public getPlatforms(): Physics.Arcade.StaticGroup {
    return this.platforms;
  }

  /**
   * Creates a default level configuration for the toaster platformer.
   * @returns Default level configuration
   */
  public static createDefaultConfig(): LevelConfig {
    const settings = GameSettings.getInstance();

    return {
      width: settings.levelWidth,
      height: settings.levelHeight,
      backgroundTexture: 'background',
      platforms: [
        // Ground platform
        {
          x: settings.levelWidth / 2,
          y: settings.levelHeight - 50,
          scaleX: settings.levelWidth / 200,
          scaleY: 1,
          isGround: true,
        },
        // Floating platforms
        {
          x: 300,
          y: settings.levelHeight - 200,
        },
        {
          x: 600,
          y: settings.levelHeight - 300,
        },
        {
          x: 1000,
          y: settings.levelHeight - 250,
        },
        {
          x: 1400,
          y: settings.levelHeight - 200,
        },
        {
          x: 1700,
          y: settings.levelHeight - 350,
        },
      ],
    };
  }
}

import { Scene, Physics } from 'phaser';
import { GameSettings } from './GameSettings';

/**
 * Interface for a platform chunk
 */
interface PlatformChunk {
  /** Chunk identifier */
  id: string;
  /** Starting X position of chunk */
  startX: number;
  /** Ending X position of chunk */
  endX: number;
  /** Platforms in this chunk */
  platforms: Physics.Arcade.Sprite[];
  /** Whether chunk has been generated */
  generated: boolean;
}

/**
 * Manages infinite world generation with procedural platform creation.
 * Generates and destroys chunks based on camera position to maintain performance.
 */
export class InfiniteWorldManager {
  private scene: Scene;
  private settings: GameSettings;
  private platforms: Physics.Arcade.StaticGroup;
  private chunks: Map<string, PlatformChunk> = new Map();
  private groundPlatforms: Physics.Arcade.Sprite[] = [];
  private lastPlayerX: number = 0;
  private renderDistance: number = 2; // Number of chunks to keep loaded on each side

  /**
   * Creates a new InfiniteWorldManager.
   * @param scene - The Phaser scene
   * @param platforms - The static physics group for platforms
   */
  constructor(scene: Scene, platforms: Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.settings = GameSettings.getInstance();
    this.platforms = platforms;
  }

  /**
   * Initializes the infinite world with initial chunks around the spawn point.
   */
  public initialize(): void {
    // Generate initial chunks around spawn (0, 0)
    for (let i = -2; i <= 2; i++) {
      this.generateChunk(i);
    }
  }

  /**
   * Updates the world based on player position, generating and removing chunks as needed.
   * @param playerX - Current X position of the closest player to camera center
   */
  public update(playerX: number): void {
    this.lastPlayerX = playerX;

    // Calculate which chunk the player is in
    const currentChunk = Math.floor(playerX / this.settings.chunkWidth);

    // Generate chunks ahead and behind the player
    for (
      let i = currentChunk - this.renderDistance;
      i <= currentChunk + this.renderDistance;
      i++
    ) {
      if (!this.chunks.has(this.getChunkId(i))) {
        this.generateChunk(i);
      }
    }

    // Remove chunks that are too far away
    this.chunks.forEach((chunk, id) => {
      const chunkIndex = parseInt(id.replace('chunk_', ''));
      if (Math.abs(chunkIndex - currentChunk) > this.renderDistance + 1) {
        this.removeChunk(id);
      }
    });
  }

  /**
   * Generates a chunk of platforms at the specified index.
   * @param chunkIndex - The chunk index to generate
   */
  private generateChunk(chunkIndex: number): void {
    const chunkId = this.getChunkId(chunkIndex);
    const startX = chunkIndex * this.settings.chunkWidth;
    const endX = startX + this.settings.chunkWidth;

    const chunk: PlatformChunk = {
      id: chunkId,
      startX,
      endX,
      platforms: [],
      generated: false,
    };

    // Generate ground platform for this chunk
    this.generateGroundPlatform(chunk);

    chunk.generated = true;
    this.chunks.set(chunkId, chunk);

    console.log(`Generated chunk ${chunkIndex} (${startX} to ${endX})`);
  }

  /**
   * Generates ground platform for a chunk.
   * @param chunk - The chunk to generate ground for
   */
  private generateGroundPlatform(chunk: PlatformChunk): void {
    const groundY = this.settings.levelHeight - this.settings.groundHeight;

    const groundPlatform = this.platforms.create(
      chunk.startX + this.settings.chunkWidth / 2,
      groundY,
      'platform',
    ) as Physics.Arcade.Sprite;

    groundPlatform.setDisplaySize(
      this.settings.chunkWidth,
      this.settings.groundHeight,
    );
    groundPlatform.body.setSize(
      this.settings.chunkWidth,
      this.settings.groundHeight,
    );
    groundPlatform.setTint(0x8b4513); // Brown color

    chunk.platforms.push(groundPlatform);
    this.groundPlatforms.push(groundPlatform);
  }

  /**
   * Removes a chunk and destroys its platforms.
   * @param chunkId - ID of the chunk to remove
   */
  private removeChunk(chunkId: string): void {
    const chunk = this.chunks.get(chunkId);
    if (!chunk) return;

    // Destroy all platforms in the chunk
    chunk.platforms.forEach((platform) => {
      // Remove from ground platforms array if it's a ground platform
      const groundIndex = this.groundPlatforms.indexOf(platform);
      if (groundIndex > -1) {
        this.groundPlatforms.splice(groundIndex, 1);
      }
      platform.destroy();
    });

    this.chunks.delete(chunkId);
    console.log(`Removed chunk ${chunkId}`);
  }

  /**
   * Gets the chunk ID for a given chunk index.
   * @param chunkIndex - The chunk index
   * @returns The chunk ID string
   */
  private getChunkId(chunkIndex: number): string {
    return `chunk_${chunkIndex}`;
  }

  /**
   * Gets all ground platforms (for toast collision detection).
   * @returns Array of ground platform sprites
   */
  public getGroundPlatforms(): Physics.Arcade.Sprite[] {
    return this.groundPlatforms;
  }

  /**
   * Gets the platform group for physics collisions.
   * @returns The platforms static group
   */
  public getPlatforms(): Physics.Arcade.StaticGroup {
    return this.platforms;
  }
}

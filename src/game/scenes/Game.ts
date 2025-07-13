import { Scene, Physics } from 'phaser';
import { Player } from '../Player';
import { GameSettings } from '../GameSettings';

export class Game extends Scene {
    private player1!: Player;
    private player2!: Player;
    private platforms!: Physics.Arcade.StaticGroup;
    private settings: GameSettings;

    constructor() {
        super('Game');
        this.settings = GameSettings.getInstance();
        console.log('Game scene constructor called');
    }

    preload() {
        console.log('Game preload started');
        this.load.setPath('assets');
        this.load.image('background', 'bg.png');
        console.log('Assets loading...');
    }

    create() {
        console.log('Game create started');
        
        this.physics.world.gravity.y = this.settings.gravityY;
        console.log('Physics gravity set to:', this.settings.gravityY);
        
        this.add.image(this.settings.levelWidth / 2, this.settings.levelHeight / 2, 'background')
            .setDisplaySize(this.settings.levelWidth, this.settings.levelHeight);
        console.log('Background added');
        
        this.createToasterTextures();
        this.createPlatforms();
        this.createPlayers();
        this.setupCamera();
        this.setupCollisions();
        this.createUI();
        
        this.physics.world.setBounds(0, 0, this.settings.levelWidth, this.settings.levelHeight);
        console.log('Game setup complete');
    }

    update() {
        if (this.player1 && this.player2) {
            this.player1.update();
            this.player2.update();
            this.updateCamera();
        }
    }

    private createToasterTextures() {
        console.log('Creating toaster textures...');
        
        const graphics = this.add.graphics();
        
        // Player 1 - Gold toaster
        graphics.fillStyle(0xFFD700);
        graphics.fillRoundedRect(0, 0, 64, 64, 8);
        graphics.fillStyle(0xFF6B35);
        graphics.fillRect(8, 8, 48, 20);
        graphics.fillRect(16, 40, 32, 8);
        graphics.generateTexture('toaster1', 64, 64);
        
        // Player 2 - Teal toaster
        graphics.clear();
        graphics.fillStyle(0x4ECDC4);
        graphics.fillRoundedRect(0, 0, 64, 64, 8);
        graphics.fillStyle(0xFF6B35);
        graphics.fillRect(8, 8, 48, 20);
        graphics.fillRect(16, 40, 32, 8);
        graphics.generateTexture('toaster2', 64, 64);
        
        graphics.destroy();
        console.log('Toaster textures created');
    }

    private createPlatforms() {
        console.log('Creating platforms...');
        
        this.platforms = this.physics.add.staticGroup();
        
        // Create platform texture
        const platformGraphics = this.add.graphics();
        platformGraphics.fillStyle(0x8B4513);
        platformGraphics.fillRect(0, 0, 200, 32);
        platformGraphics.generateTexture('platform', 200, 32);
        platformGraphics.destroy();
        
        // Ground platform
        this.platforms.create(this.settings.levelWidth / 2, this.settings.levelHeight - 50, 'platform')
            .setScale(this.settings.levelWidth / 200, 1).refreshBody();
        
        // Additional platforms
        this.platforms.create(300, this.settings.levelHeight - 200, 'platform');
        this.platforms.create(600, this.settings.levelHeight - 300, 'platform');
        this.platforms.create(1000, this.settings.levelHeight - 250, 'platform');
        this.platforms.create(1400, this.settings.levelHeight - 200, 'platform');
        this.platforms.create(1700, this.settings.levelHeight - 350, 'platform');
        
        console.log('Platforms created');
    }

    private createPlayers() {
        console.log('Creating players...');
        
        const player1Controls = {
            left: this.input.keyboard!.addKey('A'),
            right: this.input.keyboard!.addKey('D'),
            jump: this.input.keyboard!.addKey('W'),
            color: 0xFFD700
        };

        const player2Controls = {
            left: this.input.keyboard!.addKey('LEFT'),
            right: this.input.keyboard!.addKey('RIGHT'),
            jump: this.input.keyboard!.addKey('UP'),
            color: 0x4ECDC4
        };

        this.player1 = new Player(this, 200, 100, 'toaster1', player1Controls);
        this.player2 = new Player(this, 300, 100, 'toaster2', player2Controls);
        
        console.log('Players created');
    }

    private setupCamera() {
        console.log('Setting up camera...');
        this.cameras.main.setBounds(0, 0, this.settings.levelWidth, this.settings.levelHeight);
        this.cameras.main.setDeadzone(100, 100);
        console.log('Camera setup complete');
    }

    private setupCollisions() {
        console.log('Setting up collisions...');
        this.physics.add.collider(this.player1, this.platforms);
        this.physics.add.collider(this.player2, this.platforms);
        this.physics.add.collider(this.player1, this.player2);
        console.log('Collisions setup complete');
    }

    private updateCamera() {
        const centerX = (this.player1.x + this.player2.x) / 2;
        const centerY = (this.player1.y + this.player2.y) / 2;
        this.cameras.main.centerOn(centerX, centerY);
    }

    private createUI() {
        this.add.text(20, 20, 
            'TOASTER PLATFORMER\n\n' +
            'Player 1 (Gold): A/D to move, W to jump\n' +
            'Player 2 (Teal): ← / → to move, ↑ to jump\n\n' +
            'Both players can double-jump!\n' +
            'Push each other around!', 
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 10 }
            }
        ).setScrollFactor(0).setDepth(1000);
        console.log('UI created');
    }
}
import { Scene, Physics } from 'phaser';
import { GameSettings } from './GameSettings';

export class Player extends Physics.Arcade.Sprite {
    private settings: GameSettings;
    private jumpsLeft: number = 2;
    private isGrounded: boolean = false;
    private controls: any;
    
    constructor(scene: Scene, x: number, y: number, texture: string, controls: any) {
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
    
    update(): void {
        this.checkGrounded();
        this.handleMovement();
        this.handleJumping();
        
        if (this.isGrounded) {
            this.jumpsLeft = 2;
        }
    }
    
    private checkGrounded(): void {
        const body = this.body as Physics.Arcade.Body;
        this.isGrounded = body.blocked.down || body.touching.down;
    }
    
    private handleMovement(): void {
        const body = this.body as Physics.Arcade.Body;
        let speed = this.isGrounded ? this.settings.runSpeed : this.settings.airSpeed;
        
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
    
    private handleJumping(): void {
        const body = this.body as Physics.Arcade.Body;
        
        if (Phaser.Input.Keyboard.JustDown(this.controls.jump) && this.jumpsLeft > 0) {
            const impulse = this.jumpsLeft === 2 ? this.settings.jumpImpulse : this.settings.doubleJumpImpulse;
            body.setVelocityY(-impulse);
            this.jumpsLeft--;
        }
    }
    
    public getControls() {
        return this.controls;
    }
}
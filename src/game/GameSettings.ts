export class GameSettings {
    public gravityY: number = 800;
    public runSpeed: number = 220;
    public airSpeed: number = 180;
    public jumpImpulse: number = 380;
    public doubleJumpImpulse: number = 320;
    public pushDrag: number = 50;
    public levelWidth: number = 2048;
    public levelHeight: number = 768;
    
    private static _instance: GameSettings;
    
    public static getInstance(): GameSettings {
        if (!this._instance) {
            this._instance = new GameSettings();
        }
        return this._instance;
    }
    
    private constructor() {}
}
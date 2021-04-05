import { levels } from "../data/levels";

export class Config {
    public level: { imagedata: string; cache?: any };
    public gravity: Shift;
    public enableApples: boolean;
    public enablePowerups: any[];
    public snakeSize: number;
    public snakeSpeed: number;
    public snakeIncrease: number;
    public pointsApple: number;
    public pointsKnockout: number;

    constructor() {
        this.level = levels.blank;
        this.gravity = [0, 0];
        this.enableApples = true;
        this.enablePowerups = [];
        this.snakeSize = 4;
        this.snakeSpeed = 120; // Change tile every ms.
        this.snakeIncrease = 1;
        this.pointsApple = 1;
        this.pointsKnockout = 3;
    }
}

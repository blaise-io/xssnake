import { levels } from "../data/levels";

export class Config {
    level: { imagedata: string; cache?: any };
    gravity: Shift;
    enableApples: boolean;
    enablePowerups: any[];
    snakeSize: number;
    snakeSpeed: number;
    snakeIncrease: number;
    pointsApple: number;
    pointsKnockout: number;

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

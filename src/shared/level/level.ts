import { LevelAnimationRegistry } from "../levelanim/registry";
import { LevelData } from "./data";
import { LevelGravity } from "./levelGravity";

export class LevelConfig {
    gravity = [0, 0];
    enableApples = true;
    enablePowerups = [];
    snakeSize = 4;
    snakeSpeed = 120; // Change tile every ms.
    snakeAppleIncrease = 1;
    pointsApple = 1;
    pointsKnockout = 3;

    constructor(options: Partial<LevelConfig> = {}) {
        Object.assign(this, options);
    }
}

export class Level {
    image: string;
    data: LevelData;
    animations = new LevelAnimationRegistry();
    config = new LevelConfig();
    gravity = new LevelGravity();

    async load(loader: (string) => Promise<ImageData>): Promise<void> {
        this.data = new LevelData(await loader(this.image));
    }

    destruct(): void {
        delete this.animations;
        delete this.config;
        delete this.data;
        delete this.gravity;
    }
}

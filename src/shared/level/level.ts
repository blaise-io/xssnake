import { LevelAnimationRegistry } from "../levelanim/registry";
import { LevelData } from "./levelData";
import { LevelGravity } from "./levelGravity";
import { Reverse, SpeedBoost } from "./spawnables";

export class LevelSettings {
    gravity = [0, 0];
    powerups = [Reverse, SpeedBoost];
    snakeSize = 4;
    snakeSpeed = 120; // Change tile every ms.
    snakeAppleIncrease = 1;
    pointsApple = 1;
    pointsKnockout = 3;
    spawnFirstAppleAfter = 0.5;
    spawnPowerupIntervalS = [10, 60];

    constructor(options: Partial<LevelSettings> = {}) {
        Object.assign(this, options);
    }
}

export class Level {
    image: string;
    data: LevelData;
    animations = new LevelAnimationRegistry();
    settings = new LevelSettings();
    gravity = new LevelGravity();

    async load(loader: (string) => Promise<ImageData>): Promise<void> {
        this.data = new LevelData(await loader(this.image));
    }

    destruct(): void {
        delete this.animations;
        delete this.settings;
        delete this.data;
        delete this.gravity;
    }
}

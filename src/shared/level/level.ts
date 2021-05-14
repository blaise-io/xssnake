import blank from "./levels/blank.png";
import { LevelAnimationRegistry } from "../levelanim/registry";
import { LevelData } from "./levelData";
import { LevelGravity } from "./levelGravity";
import { Reverse, SpeedBoost } from "./spawnables";
import { LevelString } from "./types";

export class LevelSettings {
    gravity: Shift = [0, 0];
    snakeSize = 4;
    snakeSpeed = 120; // Change tile every ms.
    appleSnakeGrow = 1;
    spawnApples = true;
    spawnFirstAppleAfter = 1;
    pointsApple = 1;
    pointsKnockout = 3;
    powerupsEnabled = [Reverse, SpeedBoost];
    powerupsInterval: [min: number, max: number] = [10, 60];

    constructor(options: Partial<LevelSettings> = {}) {
        Object.assign(this, options);
    }
}

export class Level {
    static image: LevelString = blank;

    animations = new LevelAnimationRegistry();
    settings = new LevelSettings();
    gravity = new LevelGravity();

    constructor(public data: LevelData) {}

    destruct(): void {
        // this.animations.destruct();
        // this.settings.destruct();
        // delete this.gravity.destruct();
    }
}

export async function loadLevel(
    LevelClass: typeof Level,
    loader: (image: LevelString) => Promise<ImageData>,
): Promise<Level> {
    const imageData = await loader(LevelClass.image);
    return new LevelClass(new LevelData(imageData));
}

import blank from "./levels/blank.png";
import { LevelAnimationRegistry } from "../levelanim/registry";
import { LevelData } from "./levelData";
import { LevelGravity } from "./levelGravity";
import { Reverse, Spawnable, SpeedBoost } from "./spawnables";
import { LevelString } from "./types";

export type LevelSpawnable = [spawnable: typeof Spawnable, chance: number];

export class LevelSettings {
    readonly gravity: Shift = [0, 0];
    readonly snakeSize = 4;
    readonly snakeSpeed = 120; // Change tile every ms.
    readonly appleSnakeGrow = 1;
    readonly spawnApples = true;
    readonly spawnFirstAppleAfter = 1;
    readonly pointsApple = 1;
    readonly pointsKnockout = 3;
    readonly powerupsInterval: [min: number, max: number] = [10, 60];
    readonly powerupsEnabled: LevelSpawnable[] = [
        [Reverse, 0.1],
        [SpeedBoost, 0.9],
    ];

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

import blank from "./levels/blank.png";
import { LevelAnimationRegistry } from "../levelanim/registry";
import { LevelData } from "./levelData";
import { LevelGravity } from "./levelGravity";
import { Reverse, Spawnable, SpeedBoost } from "./spawnables";
import { LevelString } from "./types";

export type LevelSpawnable = [spawnable: typeof Spawnable, chance: number];

export class LevelSettings {
    readonly gravity: Shift = [0, 0];
    readonly snakeSize: number = 4;
    readonly snakeSpeed: number = 120; // Change tile every ms.
    readonly appleSnakeGrow: number = 1;
    readonly spawnApples: boolean = true;
    readonly spawnFirstAppleAfter: number = 1;
    readonly pointsApple: number = 1;
    readonly pointsKnockout: number = 3;
    readonly powerupsInterval: [min: number, max: number] = [1, 5];
    readonly powerupsEnabled: LevelSpawnable[] = [
        [Reverse, 0.9],
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

const levelDataCache = new WeakMap();

export async function loadLevel(
    LevelClass: typeof Level,
    loader: (image: LevelString) => Promise<ImageData>,
): Promise<Level> {
    let levelData = levelDataCache.get(LevelClass);
    if (!levelData) {
        levelData = new LevelData(await loader(LevelClass.image));
        levelDataCache.set(LevelClass, levelData);
    }
    return new LevelClass(levelData);
}

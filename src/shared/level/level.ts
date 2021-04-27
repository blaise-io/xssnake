import { LevelAnimationRegistry } from "../levelanim/registry";
import { LevelData } from "./data";
import { LevelGravity } from "./levelGravity";

export class LevelConfig {
    constructor(
        public gravity = [0, 0],
        public enableApples = true,
        public enablePowerups = [],
        public snakeSize = 4,
        public snakeSpeed = 120, // Change tile every ms.
        public snakeIncrease = 1,
        public pointsApple = 1,
        public pointsKnockout = 3,
    ) {}
}

export class Level {
    image: string;
    data: LevelData;
    config: LevelConfig;
    animations: LevelAnimationRegistry;
    gravity: LevelGravity;

    constructor() {
        this.config = new LevelConfig();
        this.animations = new LevelAnimationRegistry();
        this.gravity = new LevelGravity();
    }

    async load(loader: (string) => Promise<ImageData>): Promise<void> {
        this.data = new LevelData(await loader(this.image));
    }

    destruct(): void {
        this.config = undefined;
        this.animations = undefined;
        this.config = undefined;
    }
}

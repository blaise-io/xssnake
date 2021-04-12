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
        public pointsKnockout = 3
    ) {}
}

export class Level {
    public image: string;
    public data: LevelData;

    constructor(
        public config = new LevelConfig(),
        public animations = new LevelAnimationRegistry(),
        public gravity = new LevelGravity()
    ) {}

    destruct(): void {
        this.config = null;
        this.animations = null;
        this.config = null;
    }
}

import { Snake } from "../game/snake";
import { AUDIENCE } from "../messages";
import { Player } from "../room/player";
import { Message, MessageId } from "../room/types";
import { LevelSettings } from "./level";

export const enum SPAWNABLE_ID {
    ANONYMOUS, // In server games, effect of a power-up is unknown until hit.
    POINTS,
    REVERSE,
    SPEED_BOOST,
}

export const enum TYPE {
    APPLE,
    POWER,
}

export class SpawnMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(readonly type: TYPE, readonly coordinate: Coordinate) {}

    static deserialize(trustedNetcode: string): SpawnMessage {
        const [type, coordinate] = JSON.parse(trustedNetcode);
        return new SpawnMessage(type, coordinate);
    }

    get serialized(): string {
        return JSON.stringify(this.type, this.coordinate);
    }
}

export abstract class Spawnable {
    constructor(protected readonly levelSettings: LevelSettings, readonly coordinate: Coordinate) {}

    abstract id: SPAWNABLE_ID;
    abstract type: TYPE;
    abstract applyEffects(player: Player, snake: Snake): void;

    timer?: ReturnType<typeof setTimeout>;

    snakeNotifyModifier?: string;

    despawn(): void {}

    destruct(): void {
        // Lifetime continues after hit.
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}

export class Apple extends Spawnable {
    id = SPAWNABLE_ID.POINTS;
    type = TYPE.APPLE;

    constructor(protected readonly levelSettings: LevelSettings, readonly coordinate: Coordinate) {
        super(levelSettings, coordinate);
        this.snakeNotifyModifier = `+${levelSettings.pointsApple}`;
    }

    applyEffects(player: Player): void {
        player.score += this.levelSettings.pointsApple;
    }
}

export class AnonymousPowerup extends Spawnable {
    id = SPAWNABLE_ID.ANONYMOUS;
    type = TYPE.POWER;

    constructor(protected readonly levelSettings: LevelSettings, public coordinate: Coordinate) {
        super(levelSettings, coordinate);
    }

    applyEffects(): void {}
}

export class Reverse extends Spawnable {
    id = SPAWNABLE_ID.REVERSE;
    type = TYPE.POWER;

    applyEffects(player: Player, snake: Snake): void {
        snake.reverse();
    }
}

export class SpeedBoost extends Spawnable {
    id = SPAWNABLE_ID.SPEED_BOOST;
    type = TYPE.POWER;

    applyEffects(player: Player, snake: Snake): void {
        snake.speed += 150;
        this.timer = setTimeout(() => {
            snake.speed -= 150;
        }, 5000);
    }
}

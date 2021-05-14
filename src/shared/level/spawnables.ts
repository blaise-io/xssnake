import { Snake } from "../game/snake";
import { AUDIENCE } from "../messages";
import { Player } from "../room/player";
import { Message, MessageId } from "../room/types";
import { LevelSettings } from "./level";

export const enum SPAWN_ID {
    ANONYMOUS, // In server games, effect of a power-up is unknown until hit.
    POINTS,
    REVERSE,
    SPEED_BOOST,
}

export const enum EFFECT {
    NONE,
    BAD,
    RISKY,
    GOOD,
}

export const enum SPAWN_TYPE {
    APPLE,
    POWER,
}

export class SpawnMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(readonly type: SPAWN_TYPE, readonly coordinate: Coordinate) {}

    static deserialize(trustedNetcode: string): SpawnMessage {
        const [type, coordinate] = JSON.parse(trustedNetcode);
        return new SpawnMessage(type, coordinate);
    }

    get serialized(): string {
        return JSON.stringify([this.type, this.coordinate]);
    }
}

export class SpawnHitMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(
        readonly playerIndex: number,
        readonly id: SPAWN_ID,
        readonly type: SPAWN_TYPE,
        readonly coordinate: Coordinate,
    ) {}

    static deserialize(trustedNetcode: string): SpawnHitMessage {
        const [playerIndex, id, type, coordinate] = JSON.parse(trustedNetcode);
        return new SpawnHitMessage(playerIndex, id, type, coordinate);
    }

    get serialized(): string {
        return JSON.stringify([this.playerIndex, this.id, this.type, this.coordinate]);
    }
}

export abstract class Spawnable {
    static effect = { self: EFFECT.NONE, others: EFFECT.NONE };

    constructor(protected readonly levelSettings: LevelSettings, readonly coordinate: Coordinate) {}

    abstract id: SPAWN_ID;
    abstract type: SPAWN_TYPE;
    abstract applyEffects(player: Player, snake: Snake): void;

    active = true;
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
    static effect = { self: EFFECT.GOOD, others: EFFECT.NONE };

    id = SPAWN_ID.POINTS;
    type = SPAWN_TYPE.APPLE;

    constructor(protected readonly levelSettings: LevelSettings, readonly coordinate: Coordinate) {
        super(levelSettings, coordinate);
        this.snakeNotifyModifier = `+${levelSettings.pointsApple}`;
    }

    applyEffects(player: Player): void {
        player.score += this.levelSettings.pointsApple;
    }
}

export class AnonymousPowerup extends Spawnable {
    static effect = { self: EFFECT.NONE, others: EFFECT.NONE };

    id = SPAWN_ID.ANONYMOUS;
    type = SPAWN_TYPE.POWER;

    constructor(protected readonly levelSettings: LevelSettings, public coordinate: Coordinate) {
        super(levelSettings, coordinate);
    }

    applyEffects(): void {}
}

export class Reverse extends Spawnable {
    static effect = { self: EFFECT.BAD, others: EFFECT.NONE };

    id = SPAWN_ID.REVERSE;
    type = SPAWN_TYPE.POWER;

    applyEffects(player: Player, snake: Snake): void {
        snake.reverse();
    }
}

export class SpeedBoost extends Spawnable {
    static effect = { self: EFFECT.RISKY, others: EFFECT.NONE };

    id = SPAWN_ID.SPEED_BOOST;
    type = SPAWN_TYPE.POWER;

    applyEffects(player: Player, snake: Snake): void {
        snake.speed += 150;
        this.timer = setTimeout(() => {
            snake.speed -= 150;
        }, 5000);
    }
}

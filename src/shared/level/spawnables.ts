import { Snake } from "../game/snake";
import { AUDIENCE } from "../messages";
import { Player } from "../room/player";
import { Message, MessageId } from "../room/types";
import { LevelSettings } from "./level";

// TODO: Powerups:
// speedIncPerm
// reverseOthers
// speedBoostOthers
// speedDownOthers
// IncTailSelf
// cutTailOthers
// spawnApples
// spawnPowerups
// reverseSelf
// speedBoostSelf
// incTailOthers
// cutTailSelf
// speedDownSelf

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
        readonly playerId: number,
        readonly spawnId: SPAWN_ID,
        readonly type: SPAWN_TYPE,
        readonly coordinate: Coordinate,
    ) {}

    static deserialize(trustedNetcode: string): SpawnHitMessage {
        const [playerId, spawnId, type, ...coordinate] = JSON.parse(trustedNetcode);
        return new SpawnHitMessage(playerId, spawnId, type, coordinate);
    }

    get serialized(): string {
        return JSON.stringify([this.playerId, this.spawnId, this.type, ...this.coordinate]);
    }
}

export class Spawnable {
    static id: SPAWN_ID;
    static effect = { self: EFFECT.NONE, others: EFFECT.NONE };

    active = true;
    type = SPAWN_TYPE.POWER;
    timer?: ReturnType<typeof setTimeout>;

    constructor(protected readonly levelSettings: LevelSettings, readonly coordinate: Coordinate) {}

    applyEffects(player: Player, snake: Snake): void {
        console.warn("Overwrite", player, snake);
    }

    destruct(): void {
        // Lifetime continues after hit.
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}

export class Apple extends Spawnable {
    static id = SPAWN_ID.POINTS;
    static effect = { self: EFFECT.GOOD, others: EFFECT.NONE };

    type = SPAWN_TYPE.APPLE;

    applyEffects(player: Player, snake: Snake): void {
        player.score += this.levelSettings.pointsApple;
        snake.size += this.levelSettings.appleSnakeGrow;
    }
}

export class AnonymousPowerup extends Spawnable {
    static id = SPAWN_ID.ANONYMOUS;
    static effect = { self: EFFECT.NONE, others: EFFECT.NONE };
}

export class Reverse extends Spawnable {
    static effect = { self: EFFECT.BAD, others: EFFECT.NONE };
    static id = SPAWN_ID.REVERSE;

    applyEffects(player: Player, snake: Snake): void {
        snake.speed *= 3;
        snake.reverse();

        this.timer = setTimeout(() => {
            snake.speed /= 3;
        }, 1000);
    }
}

export class SpeedBoost extends Spawnable {
    static id = SPAWN_ID.SPEED_BOOST;
    static effect = { self: EFFECT.RISKY, others: EFFECT.NONE };

    applyEffects(player: Player, snake: Snake): void {
        snake.speed *= 0.8;
        this.timer = setTimeout(() => {
            snake.speed /= 0.8;
        }, 5000);
    }
}

// TODO: Spawn extra apples, is server effect only?

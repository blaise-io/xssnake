import { AUDIENCE } from "../messages";
import { Player } from "../room/player";
import { Message, MessageId } from "../room/types";
import { LevelSettings } from "./level";

export const enum SPAWNABLE_ID {
    POINTS,
    REVERSE,
    SPEED_BOOST,
}

export const enum TYPE {
    APPLE,
    POWER,
}

export class SpawnableMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public type: TYPE, public coordinate: Coordinate) {}

    static deserialize(trustedNetcode: string): SpawnableMessage {
        const [type, coordinate] = JSON.parse(trustedNetcode);
        return new SpawnableMessage(type, coordinate);
    }

    get serialized(): string {
        return JSON.stringify(this.type, this.coordinate);
    }
}

export abstract class Spawnable {
    abstract type: TYPE;
    timer: ReturnType<typeof setTimeout>;

    constructor(public levelSettings: LevelSettings, public coordinate: Coordinate) {}

    abstract applyEffects(player: Player): void;
    abstract id: SPAWNABLE_ID;
    snakeNotifyModifier?: string;

    despawn(): void {}

    destruct(): void {
        // Lifetime continues after hit.
        clearTimeout(this.timer);
    }
}

export class Apple extends Spawnable {
    id: SPAWNABLE_ID.POINTS;
    type = TYPE.APPLE;

    constructor(public levelSettings: LevelSettings, public coordinate: Coordinate) {
        super(levelSettings, coordinate);
        this.snakeNotifyModifier = `+${levelSettings.pointsApple}`;
    }

    applyEffects(player: Player): void {
        player.score += this.levelSettings.pointsApple;
    }
}

export class Reverse extends Spawnable {
    type = TYPE.POWER;
    id: SPAWNABLE_ID.REVERSE;

    applyEffects(player: Player): void {
        player.snake.reverse();
    }
}

export class SpeedBoost extends Spawnable {
    id: SPAWNABLE_ID.SPEED_BOOST;
    type = TYPE.POWER;

    applyEffects(player: Player): void {
        player.snake.speed += 150;
        this.timer = setTimeout(() => {
            player.snake.speed -= 150;
        }, 5000);
    }
}

import { levelSets } from "../levelSet/levelSets";
import { Level } from "../level/level";
import { AUDIENCE, NETCODE } from "./netcode";
import { Player } from "./player";
import { RoomOptions } from "./roomOptions";
import { PlayerRegistry } from "./playerRegistry";
import { Message } from "./types";

export class RoomRoundMessage implements Message {
    static id = NETCODE.ROUND_SERIALIZE;
    static audience = AUDIENCE.CLIENT;

    constructor(public levelSetIndex: number, public levelIndex: number) {}

    static fromNetcode(trustedNetcode: string): RoomRoundMessage {
        return new RoomRoundMessage(...(JSON.parse(trustedNetcode) as [number, number]));
    }

    static fromRound(round: Round): RoomRoundMessage {
        return new RoomRoundMessage(round.levelSetIndex, round.levelIndex);
    }

    get netcode(): string {
        return JSON.stringify([this.levelSetIndex, this.levelIndex]);
    }
}

export class RoundCountdownMessage implements Message {
    static id = NETCODE.ROUND_COUNTDOWN;
    static audience = AUDIENCE.CLIENT;

    constructor(public enabled: boolean) {}

    static fromNetcode(trustedNetcode: string): RoundCountdownMessage {
        return new RoundCountdownMessage(Boolean(parseInt(trustedNetcode, 10)));
    }

    get netcode(): string {
        return Number(this.enabled).toString();
    }
}

export class RoundStartMessage implements Message {
    static id = NETCODE.ROUND_START;
    static audience = AUDIENCE.CLIENT;

    static fromNetcode(): RoundStartMessage {
        return new RoundStartMessage();
    }

    get netcode(): string {
        return "";
    }
}

export class Round {
    levelSetIndex: number;
    levelIndex: number;
    level: Level;
    private index: number;
    started: boolean;

    constructor(public players: PlayerRegistry<Player>, public options: RoomOptions) {
        delete this.levelSetIndex;
        delete this.levelIndex;
        this.index = 0;
        this.started = false;
    }

    get LevelClass(): typeof Level {
        return levelSets[this.levelSetIndex][this.levelIndex];
    }
}

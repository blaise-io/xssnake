import { AUDIENCE, NETCODE } from "./netcode";
import { Round } from "./round";
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

export class RoundWrapupMessage implements Message {
    static id = NETCODE.ROUND_WRAPUP;
    static audience = AUDIENCE.CLIENT;

    constructor(public winningPlayerIndex = -1) {}

    static fromNetcode(trustedNetcode: string): RoundWrapupMessage {
        return new RoundWrapupMessage(parseInt(trustedNetcode, 10));
    }

    get netcode(): string {
        return this.winningPlayerIndex.toString();
    }
}

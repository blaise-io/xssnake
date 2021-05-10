import { AUDIENCE } from "../messages";
import { Round } from "./round";
import { Message, MessageId } from "./types";

export class RoundMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public levelSetIndex: number, public levelIndex: number) {}

    static deserialize(trustedNetcode: string): RoundMessage {
        return new RoundMessage(...(JSON.parse(trustedNetcode) as [number, number]));
    }

    static fromRound(round: Round): RoundMessage {
        return new RoundMessage(round.levelSetIndex as number, round.levelIndex as number);
    }

    get serialized(): string {
        return JSON.stringify([this.levelSetIndex, this.levelIndex]);
    }
}

export class RoundCountdownMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public enabled: boolean) {}

    static deserialize(trustedNetcode: string): RoundCountdownMessage {
        return new RoundCountdownMessage(!!+trustedNetcode);
    }

    get serialized(): string {
        return Number(this.enabled).toString();
    }
}

export class RoundStartMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    static deserialize(): RoundStartMessage {
        return new RoundStartMessage();
    }

    get serialized(): string {
        return "";
    }
}

export class RoundWrapupMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public winningPlayerIndex = -1) {}

    static deserialize(trustedNetcode: string): RoundWrapupMessage {
        return new RoundWrapupMessage(+trustedNetcode);
    }

    get serialized(): string {
        return this.winningPlayerIndex.toString();
    }
}

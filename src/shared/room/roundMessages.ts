import { AUDIENCE } from "../messages";
import { Round } from "./round";
import { Message, MessageId } from "./types";

export class RoundLevelMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public levelIndex: number) {}

    static deserialize(trustedNetcode: string): RoundLevelMessage {
        return new RoundLevelMessage(+trustedNetcode);
    }

    static fromRound(round: Round): RoundLevelMessage {
        return new RoundLevelMessage(round.levelIndex as number);
    }

    get serialized(): string {
        return this.levelIndex.toString();
    }
}

export class RoundCountDownMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public enabled: boolean) {}

    static deserialize(trustedNetcode: string): RoundCountDownMessage {
        return new RoundCountDownMessage(!!+trustedNetcode);
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

    constructor(public winningPlayerId = -1) {}

    static deserialize(trustedNetcode: string): RoundWrapupMessage {
        return new RoundWrapupMessage(+trustedNetcode);
    }

    get serialized(): string {
        return this.winningPlayerId.toString();
    }
}

import { AUDIENCE } from "../messages";
import { Message, MessageId } from "./types";

export class RoundLevelMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(readonly levelIndex: number) {}

    static deserialize(trustedNetcode: string): RoundLevelMessage {
        return new RoundLevelMessage(+trustedNetcode);
    }

    get serialized(): string {
        return this.levelIndex.toString();
    }
}

export class RoundCountDownMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(readonly enabled: boolean, readonly roundsPlayed: number) {}

    static deserialize(trustedNetcode: string): RoundCountDownMessage {
        const [enabled, roundsPlayed] = JSON.parse(trustedNetcode);
        return new RoundCountDownMessage(!!enabled, roundsPlayed);
    }

    get serialized(): string {
        return JSON.stringify([+this.enabled, this.roundsPlayed]);
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

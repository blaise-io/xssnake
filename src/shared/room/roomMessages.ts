import { ROOM_STATUS } from "../const";
import { AUDIENCE } from "../messages";
import { isStrOfLen } from "../util/sanitizer";
import { RoomOptions } from "./roomOptions";
import { Message, MessageId } from "./types";

export const ROOM_KEY_LENGTH = 5;

export class RoomOptionsServerMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.SERVER_MATCHMAKING;

    constructor(public options: RoomOptions) {}

    static deserialize(untrustedNetcode: string): RoomOptionsServerMessage | undefined {
        try {
            const data = JSON.parse(untrustedNetcode);
            const roomOptions = new RoomOptions(
                +data[0],
                +data[1],
                !!data[2],
                !!data[3],
                !!data[4],
                !!data[5],
            );
            return new RoomOptionsServerMessage(roomOptions);
        } catch (error) {
            return;
        }
    }

    get serialized(): string {
        return JSON.stringify([
            this.options.maxPlayers,
            this.options.levelSetIndex,
            Number(this.options.isQuickGame),
            Number(this.options.hasPowerups),
            Number(this.options.isPrivate),
            Number(this.options.isXSS),
        ]);
    }
}

export class RoomOptionsClientMessage extends RoomOptionsServerMessage {
    static audience = AUDIENCE.CLIENT;
}

export class RoomJoinMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.SERVER_MATCHMAKING;

    constructor(public key: string) {}

    static deserialize(untrustedNetcode: string): RoomJoinMessage | undefined {
        if (isStrOfLen(untrustedNetcode, ROOM_KEY_LENGTH)) {
            return new RoomJoinMessage(untrustedNetcode);
        }
    }

    get serialized(): string {
        return this.key;
    }
}

export class RoomManualStartMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.SERVER_ROOM;

    static deserialize(): RoomManualStartMessage | undefined {
        return new RoomManualStartMessage();
    }

    get serialized(): string {
        return "";
    }
}

export class RoomGetStatusMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.SERVER_MATCHMAKING;

    constructor(public key: string) {}

    static deserialize(untrustedNetcode: string): RoomGetStatusMessage | undefined {
        if (isStrOfLen(untrustedNetcode, ROOM_KEY_LENGTH)) {
            return new RoomGetStatusMessage(untrustedNetcode);
        }
    }

    get serialized(): string {
        return this.key;
    }
}

export class RoomKeyMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public key: string) {}

    get serialized(): string {
        return this.key;
    }

    static deserialize(netcode: string): RoomKeyMessage {
        return new RoomGetStatusMessage(netcode);
    }
}

export class RoomJoinErrorMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public status: ROOM_STATUS) {}

    static deserialize(untrustedNetcode: string): RoomJoinErrorMessage {
        return new RoomJoinErrorMessage(+untrustedNetcode);
    }

    get serialized(): string {
        return this.status.toString();
    }
}

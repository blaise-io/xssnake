import { ROOM_KEY_LENGTH, ROOM_STATUS } from "../const";
import { AUDIENCE } from "../messages";
import { isStrOfLen } from "../util/sanitizer";
import { RoomOptions } from "./roomOptions";
import { Message, MessageId } from "./types";

export class RoomOptionsMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.SERVER_MATCHMAKING;

    constructor(public options: RoomOptions) {}

    static deserialize(untrustedNetcode: string): RoomOptionsMessage | undefined {
        try {
            const data = JSON.parse(untrustedNetcode);
            const roomOptions = new RoomOptions(
                parseInt(data[0], 10),
                parseInt(data[1], 10),
                Boolean(data[2]),
                Boolean(data[3]),
                Boolean(data[4]),
                Boolean(data[5]),
            );
            return new RoomOptionsMessage(roomOptions);
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
        return new RoomJoinErrorMessage(parseInt(untrustedNetcode, 10));
    }

    get serialized(): string {
        return this.status.toString();
    }
}

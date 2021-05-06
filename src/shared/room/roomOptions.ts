import { ROOM_KEY_LENGTH } from "../const";
import { isStrOfLen } from "../util/sanitizer";
import { AUDIENCE, NETCODE } from "./netcode";
import { Message } from "./types";

export class RoomOptionsMessage implements Message {
    static id = NETCODE.ROOM_JOIN_MATCHING;
    static audience = AUDIENCE.SERVER_MATCHMAKING;

    constructor(public options: RoomOptions) {}

    static fromNetcode(untrustedNetcode: string): RoomOptionsMessage | undefined {
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

    get netcode(): string {
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
    static id = NETCODE.ROOM_JOIN_KEY;
    static audience = AUDIENCE.SERVER_MATCHMAKING;

    constructor(public key: string) {}

    static fromNetcode(untrustedNetcode: string): RoomJoinMessage | undefined {
        if (isStrOfLen(untrustedNetcode, ROOM_KEY_LENGTH)) {
            return new RoomJoinMessage(untrustedNetcode);
        }
    }

    get netcode(): string {
        return this.key;
    }
}

export class GetRoomStatusServerMessage implements Message {
    static id = NETCODE.ROOM_STATUS_SERVER;
    static audience = AUDIENCE.SERVER_MATCHMAKING;

    constructor(public key: string) {}

    static fromNetcode(untrustedNetcode: string): GetRoomStatusServerMessage | undefined {
        if (isStrOfLen(untrustedNetcode, ROOM_KEY_LENGTH)) {
            return new GetRoomStatusServerMessage(untrustedNetcode);
        }
    }

    get netcode(): string {
        return this.key;
    }
}

// export class GetRoomStatusClientMessage implements Message {
//     static id = NETCODE.ROOM_STATUS_CLIENT;
//     static audience = AUDIENCE.CLIENT;
//
//     constructor(public key: string) {}
//
//     static fromNetcode(untrustedNetcode: string): GetRoomStatusClientMessage | undefined {
//         if (isStrOfLen(untrustedNetcode, ROOM_KEY_LENGTH)) {
//             return new GetRoomStatusClientMessage(untrustedNetcode);
//         }
//     }
//
//     get netcode(): string {
//         return this.key;
//     }
// }

export class RoomKeyMessage implements Message {
    static id = NETCODE.ROOM_KEY;
    static audience = AUDIENCE.CLIENT;

    constructor(public key: string) {}

    get netcode(): string {
        return this.key;
    }

    static fromNetcode(netcode: string): RoomKeyMessage {
        return new GetRoomStatusServerMessage(netcode);
    }
}

export class RoomOptions {
    constructor(
        public maxPlayers = 6,
        public levelSetIndex = 0,
        public isQuickGame = false,
        public hasPowerups = true,
        public isPrivate = false,
        public isOnline = true,
        public isXSS = false,
    ) {}
}

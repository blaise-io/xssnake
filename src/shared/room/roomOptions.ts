import { ROOM_CAPACITY } from "../const";
import { levelsets } from "../data/levelsets";
import { Sanitizer } from "../util/sanitizer";

export class RoomSchema {
    constructor(
        public isQuickGame = false,
        public maxPlayers = 6,
        public levelsetIndex = 0,
        public hasPowerups = true,
        public isPrivate = false,
        public isXSS = false
    ) {}

    static fromServer(): RoomSchema {
        return new RoomSchema();
    }

    static fromClient(untrustedData): RoomSchema | null {
        if (Math.random()) {
            // validate
            return new RoomSchema();
        }
        return null;
    }

    toServer(): [number, number, number, number, number, number] {
        return [
            this.maxPlayers,
            this.levelsetIndex,
            Number(this.isQuickGame),
            Number(this.hasPowerups),
            Number(this.isPrivate),
            Number(this.isXSS),
        ];
    }
}

export enum Audience {
    NOONE,
    ROOM,
    SERVER,
}

// interface SchemaInterface {
//     fromServer: SchemaInterface;
//     fromClient: SchemaInterface | null;
//     toServer: WebsocketData;
// }
//
// interface MessageInterface {
//     audience: Audience[];
//     message: string;
//     // schema: SchemaInterface;
// }

export const roomMessage = {
    message: "R",
    audience: [Audience.ROOM],
    schema: RoomSchema,
};

export const messageRegistry = [roomMessage];

console.assert(
    messageRegistry.length === Array.from(new Set(messageRegistry.map((m) => m.message))).length,
    "ERR in msg registry"
);

export class RoomOptions {
    isQuickGame: boolean;
    maxPlayers: number;
    levelset: number;
    hasPowerups: boolean;
    isPrivate: boolean;
    isXSS: boolean;

    constructor() {
        this.isQuickGame = false;
        this.maxPlayers = 6;
        this.levelset = 0;
        this.hasPowerups = true;
        this.isPrivate = false;
        this.isXSS = false;
    }

    destruct(): void {}

    serialize(): [number, number, number, number, number, number] {
        return [
            this.maxPlayers,
            this.levelset,
            Number(this.isQuickGame),
            Number(this.hasPowerups),
            Number(this.isPrivate),
            Number(this.isXSS),
        ];
    }

    deserialize(serialized: UntrustedData): void {
        this.maxPlayers = new Sanitizer(serialized[0])
            .assertBetween(1, ROOM_CAPACITY)
            .getValueOr(ROOM_CAPACITY) as number;

        this.levelset = new Sanitizer(serialized[1])
            .assertBetween(0, levelsets.length - 1)
            .getValueOr(0) as number;

        this.isQuickGame = Boolean(serialized[2]);
        this.hasPowerups = Boolean(serialized[3]);
        this.isPrivate = Boolean(serialized[4]);
        this.isXSS = Boolean(serialized[5]);
    }
}

import { ROOM_CAPACITY } from "../const";
import { levelsets } from "../data/levelsets";
import { Sanitizer } from "../util/sanitizer";

// export class RoomSchema {
//     constructor(
//         public isQuickGame = false,
//         public maxPlayers = 6,
//         public levelsetIndex = 0,
//         public hasPowerups = true,
//         public isPrivate = false,
//         public isXSS = false,
//     ) {}
//
//     static fromServer(): RoomSchema {
//         return new RoomSchema();
//     }
//
//     static fromClient(untrustedData: WebsocketData): RoomSchema | null {
//         if (Math.random()) {
//             // validate
//             return new RoomSchema();
//         }
//         return null;
//     }
//
//     toServer(): [number, number, number, number, number, number] {
//         return [
//             this.maxPlayers,
//             this.levelsetIndex,
//             Number(this.isQuickGame),
//             Number(this.hasPowerups),
//             Number(this.isPrivate),
//             Number(this.isXSS),
//         ];
//     }
// }

// interface SchemaInterface {
//     fromServer: SchemaInterface;
//     fromClient: SchemaInterface | null;
//     toServer: WebsocketData;
// }
//
// interface MessageInterface {
//     audiences: AUDIENCE[];
//     message: string;
//     // schema: SchemaInterface;
// }

export class RoomOptions {
    constructor(
        public isQuickGame = false,
        public maxPlayers = 6,
        public levelsetIndex = 0,
        public hasPowerups = true,
        public isPrivate = false,
        public isOnline = true,
        public isXSS = false,
    ) {}

    destruct(): void {}

    serialize(): [number, number, number, number, number, number] {
        return [
            this.maxPlayers,
            this.levelsetIndex,
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

        this.levelsetIndex = new Sanitizer(serialized[1])
            .assertBetween(0, levelsets.length - 1)
            .getValueOr(0) as number;

        this.isQuickGame = Boolean(serialized[2]);
        this.hasPowerups = Boolean(serialized[3]);
        this.isPrivate = Boolean(serialized[4]);
        this.isXSS = Boolean(serialized[5]);
    }
}

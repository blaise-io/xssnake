import { AUDIENCE, Message, NETCODE } from "./netcode";

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
            this.options.levelsetIndex,
            Number(this.options.isQuickGame),
            Number(this.options.hasPowerups),
            Number(this.options.isPrivate),
            Number(this.options.isXSS),
        ]);
    }
}

export class RoomOptions {
    constructor(
        public maxPlayers = 6,
        public levelsetIndex = 0,
        public isQuickGame = false,
        public hasPowerups = true,
        public isPrivate = false,
        public isOnline = true,
        public isXSS = false,
    ) {}
}

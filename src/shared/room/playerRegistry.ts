import { ROOM_STATUS } from "../const";
import { AUDIENCE, NETCODE } from "./netcode";
import { Player } from "./player";
import { Message } from "./types";

export class RoomPlayersMessage implements Message {
    static id = NETCODE.ROOM_PLAYERS;
    static audience = AUDIENCE.CLIENT;

    constructor(public players: PlayerRegistry<Player>, public localPlayer?: Player) {}

    static fromNetcode(untrustedNetcode: string): RoomPlayersMessage {
        const datas = JSON.parse(untrustedNetcode);
        const players = new PlayerRegistry<Player>();
        for (let i = 0, m = datas.length; i < m; i++) {
            const data = datas[i];
            players.push(new Player(data[0], Boolean(data[1]), Boolean(data[2]), data[3]));
        }
        return new RoomPlayersMessage(players);
    }

    get netcode(): string {
        const players = [];
        for (let i = 0, m = this.players.length; i < m; i++) {
            const player = this.players[i];
            players.push([
                player.name,
                Number(player.connected),
                Number(player === this.localPlayer),
                player.score,
            ]);
        }
        return JSON.stringify(players);
    }
}

export class JoinRoomErrorMessage implements Message {
    static id = NETCODE.ROOM_JOIN_ERROR;
    static audience = AUDIENCE.CLIENT;

    constructor(public status: ROOM_STATUS) {}

    static fromNetcode(untrustedNetcode: string): JoinRoomErrorMessage {
        return new JoinRoomErrorMessage(parseInt(untrustedNetcode, 10));
    }

    get netcode(): string {
        return this.status.toString();
    }
}

export class PlayerRegistry<T> extends Array<T> {
    constructor(...items: T[]) {
        super(); // new Array();
        this.push(...items);
    }

    destruct(): void {
        this.length = 0;
    }

    remove(player: T): void {
        const index = this.indexOf(player);
        if (index !== -1) {
            this.splice(index, 1);
        }
    }

    isHost(player: T): boolean {
        return 0 === this.indexOf(player);
    }
}

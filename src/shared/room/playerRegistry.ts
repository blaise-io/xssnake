import { ROOM_STATUS } from "../const";
import { AUDIENCE, Message, NETCODE } from "./netcode";
import { Player } from "./player";

export class RoomPlayersMessage implements Message {
    static id = NETCODE.ROOM_PLAYERS;
    static audience = AUDIENCE.CLIENT;

    constructor(public players: PlayerRegistry) {}

    fromNetcode(untrustedNetcode: string): RoomPlayersMessage {
        const datas = JSON.parse(untrustedNetcode);
        const players = new PlayerRegistry();
        for (let i = 0, m = datas.length; i < m; i++) {
            const data = datas[i];
            players.add(new Player(data[0], Boolean(data[1]), Boolean(data[2]), data[3]));
        }

        return new RoomPlayersMessage(players);
    }

    get netcode(): string {
        const players = [];
        for (let i = 0, m = this.players.players.length; i < m; i++) {
            const player = this.players.players[i];
            players.push([
                player.name,
                Number(player.connected),
                Number(player.local),
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

    fromNetcode(untrustedNetcode: string): JoinRoomErrorMessage {
        return new JoinRoomErrorMessage(parseInt(untrustedNetcode, 10));
    }

    get netcode(): string {
        return this.status.toString();
    }
}

export class PlayerRegistry {
    players: Player[];

    constructor(...players: Player[]) {
        this.players = players;
    }

    destruct(): void {
        this.players.length = 0;
    }

    /** @deprecated */
    serialize(localPlayer: Player): [string, number][] {
        const serialized = [];
        for (let i = 0, m = this.players.length; i < m; i++) {
            serialized.push(this.players[i].serialize(localPlayer === this.players[i]));
        }
        return serialized;
    }

    add(player: Player): void {
        this.players.push(player);
    }

    remove(player: Player): void {
        const index = this.players.indexOf(player);
        if (-1 !== index) {
            this.players.splice(index, 1);
        }
    }

    getTotal(): number {
        return this.players.length;
    }

    isHost(player: Player): boolean {
        return 0 === this.players.indexOf(player);
    }
}

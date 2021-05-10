import { AUDIENCE } from "../messages";
import { Player } from "./player";
import { Message, MessageId } from "./types";

export class PlayersMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public players: PlayerRegistry<Player>, public localPlayer?: Player) {}

    static deserialize(untrustedNetcode: string): PlayersMessage {
        const datas = JSON.parse(untrustedNetcode);
        const players = new PlayerRegistry<Player>();
        for (let i = 0, m = datas.length; i < m; i++) {
            const data = datas[i];
            players.push(new Player(data[0], !!data[1], !!data[2], data[3]));
        }
        return new PlayersMessage(players);
    }

    get serialized(): string {
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

export class PlayerRegistry<T> extends Array<T> {
    constructor(...items: T[]) {
        super(); // new Array();
        this.push(...items);
    }

    destruct(): void {
        for (let i = 0, m = this.length; i < m; i++) {
            ((this[i] as unknown) as Player).destruct();
        }
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

    hasCoordinate(coordinate: Coordinate): boolean {
        for (let i = 0, m = this.length; i < m; i++) {
            const player = (this[i] as unknown) as Player;
            if (player.snake && player.snake.hasCoordinate(coordinate)) {
                return true;
            }
        }
        return false;
    }
}

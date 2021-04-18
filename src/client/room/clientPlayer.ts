/**
 * Client-Server communication
 * @param {string=} name
 * @constructor
 * @extends {room.Player}
 */
import { Level } from "../../shared/level/level";
import { Player } from "../../shared/room/player";
import { ClientSnake } from "../game/clientSnake";

export class ClientPlayer extends Player {
    snake: ClientSnake;
    local: boolean;

    constructor(name = "") {
        super(name);
        this.snake = null;
        this.local = false;
    }

    /**
     * @param {Array} serialized
     */
    deserialize(serialized): void {
        Player.prototype.deserialize.apply(this, arguments);
        if (!this.connected && this.snake) {
            this.snake.setCrashed();
        }
    }

    setSnake(index: number, level: Level): void {
        this.snake = new ClientSnake(index, this.local, this.name, level);
    }

    unsetSnake() {
        if (this.snake) {
            this.snake.destruct();
        }
    }
}

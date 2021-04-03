/**
 * Client-Server communication
 * @param {string=} name
 * @constructor
 * @extends {room.Player}
 */
import { Player } from "../../shared/room/player";
import { ClientSnake } from "../game/clientSnake";

export class ClientPlayer extends Player {

    snake: ClientSnake;
    local: boolean;

    constructor(name="") {
        super(name);
        this.snake = null;
        this.local = false;
    }

    /**
     * @param {Array} serialized
     */
    deserialize(serialized) {
        Player.prototype.deserialize.apply(this, arguments);
        if (!this.connected && this.snake) {
            this.snake.setCrashed();
        }
    }

    /**
     * @param {number} index
     * @param {level.Level} level
     */
    setSnake(index, level) {
        this.snake = new ClientSnake(
            index, this.local, this.name, level
        );
    }    unsetSnake() {
        if (this.snake) {
            this.snake.destruct();
        }
    }

}

/**
 * @param {string=} name
 * @constructor
 */
import { Snake } from "../snake";

export class Player {

    connected: boolean;
    score: number;
    snake: Snake;
    local: boolean;

    constructor(public name='') {
        this.connected = false;
        this.score = 0;
        this.snake = null;
    }

    /**
     * @param {Array} serialized
     */
    deserialize(serialized) {
        this.name = serialized[0];
        this.connected = Boolean((serialized[1] & 1) >> 0);
        this.local = Boolean((serialized[1] & 2) >> 1);
        this.score = serialized[1] >> 2;
    }

    /**
     * @param {boolean} local
     * @return {Array.<string|number>}
     */
    serialize(local) {
        return [
            this.name, (Number(this.connected) << 0) | (local << 1) | (this.score << 2)
        ];
    }

}
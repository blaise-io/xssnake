/**
 * @param {number} type
 * @param {netcode.Client} client
 * @param {netcode.Client=} opponent
 * @constructor
 */
export class Crash {
    constructor(Crash) {
    this.type = type;
    this.client = client;

    this.opponent = opponent;
    /** @type {Coordinate} */
    this.location = null;

    this.parts = client.snake.parts.slice();
    this.time = new Date();
    this.draw = this.detectDraw();
};



    detectDraw() {
        var diff;
        if (this.opponent) {
            diff = this.client.snake.direction + this.opponent.snake.direction;
            if (Math.abs(diff) === 2) {
                this.type = CRASH_OPPONENT_DRAW;
                return true;
            }
        }
        return false;
    },

    emitNotice() {
        var data = [
            NOTICE_CRASH,
            this.type,
            this.client.model.index
        ];
        if (this.opponent) {
            data.push(this.opponent.model.index);
        }
        this.client.room.emit(NC_CHAT_NOTICE, data);
    }

};

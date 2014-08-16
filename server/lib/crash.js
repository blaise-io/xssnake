'use strict';

/**
 * @param {number} type
 * @param {xss.Client} client
 * @param {xss.Client=} opponent
 * @constructor
 */
xss.Crash = function(type, client, opponent) {
    this.type = type;
    this.client = client;

    this.opponent = opponent;
    /** @type {xss.Coordinate} */
    this.location = null;

    this.parts = client.snake.parts.slice();
    this.time = new Date();
    this.draw = this.detectDraw();
};

xss.Crash.prototype = {

    detectDraw: function() {
        var diff;
        if (this.opponent) {
            diff = this.client.snake.direction + this.opponent.snake.direction;
            if (Math.abs(diff) === 2) {
                this.type = xss.CRASH_OPPONENT_DRAW;
                return true;
            }
        }
        return false;
    },

    emitNotice: function() {
        var data = [
            xss.NOTICE_CRASH,
            this.type,
            this.client.model.index
        ];
        if (this.opponent) {
            data.push(this.opponent.model.index);
        }
        this.client.room.emit(xss.EVENT_CHAT_NOTICE, data);
    }

};

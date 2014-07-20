'use strict';

/**
 * @param {number} type
 * @param {xss.Client} client
 * @constructor
 */
xss.Crash = function(type, client) {
    this.type = type;
    this.client = client;

    /** @type {xss.Client} */
    this.opponent = null;
    /** @type {xss.Coordinate} */
    this.part = null;

    this.parts = client.snake.parts.slice();
    this.time = new Date();
    this.draw = this.detectDraw();

    if (this.draw) {
        this.type = xss.CRASH_OPPONENT_DRAW;
    }
};

xss.Crash.prototype = {

    detectDraw: function() {
        var diff;
        if (this.opponent) {
            diff = this.client.snake.direction + this.opponent.snake.direction;
            return (Math.abs(diff) === 2);
        } else {
            return false;
        }
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

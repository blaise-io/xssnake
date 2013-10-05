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
    this.opponent = opponent || null;

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
            this.client.index
        ];
        if (this.opponent) {
            data.push(this.opponent.index);
        }
        this.client.room.emit(xss.EVENT_CHAT_NOTICE, data);
    }

};

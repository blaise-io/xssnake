/*jshint globalstrict:true, node:true, sub:true*/
'use strict';

var util = require('util');
var CONST = require('../shared/const.js');

/**
 * @param {number} type
 * @param {Client} client
 * @param {Client=} opponent
 * @constructor
 */
function Crash(type, client, opponent) {
    this.type = type;
    this.client = client;
    this.opponent = opponent || null;

    this.parts = client.snake.parts.slice();
    this.time = new Date();
    this.draw = this.detectDraw();

    if (this.draw) {
        this.type = CONST.CRASH_OPPONENT_DRAW;
    }
}

module.exports = Crash;

Crash.prototype = {

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
            CONST.NOTICE_CRASH,
            this.type,
            this.client.index
        ];
        if (this.opponent) {
            data.push(this.opponent.index);
        }
        this.client.room.emit(CONST.EVENT_CHAT_NOTICE, data);
    }

};

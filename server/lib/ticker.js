/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * @param {number} tick
 * @constructor
 */
function Ticker(tick) {
    this.lasttick = +new Date();
    setInterval(this.tick.bind(this), tick);
}

util.inherits(Ticker, EventEmitter);

module.exports = Ticker;

Ticker.prototype.tick = function() {
    var now = +new Date(),
        elapsed = now - this.lasttick;
    this.emit('tick', elapsed);
    this.lasttick = new Date();
};
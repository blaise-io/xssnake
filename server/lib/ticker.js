/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var util = require('util');
var nodeEvents = require('events');

/**
 * @param {number} tick
 * @extends {EventEmitter}
 * @constructor
 */
function Ticker(tick) {
    this._time = +new Date();
    setInterval(this.tick.bind(this), tick);
}

util.inherits(Ticker, nodeEvents.EventEmitter);
module.exports = Ticker;

Ticker.prototype.tick = function() {
    var now = +new Date(),
        elapsed = now - this._time;
    this.emit('tick', elapsed);
    this._time = new Date();
};

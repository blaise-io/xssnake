'use strict';

var events = require('events');

xss.EventEmitter = function() {
    this.time = +new Date();
    this.emitter = new events.EventEmitter();
    this.emitter.setMaxListeners(300);
    this.tick();
};

xss.EventEmitter.prototype = {

    destruct: function() {
        clearInterval(this.interval);
    },

    tick: function() {
        this.interval = setInterval(function() {
            this.emitter.emit(xss.SERVER_TICK, new Date() - this.time);
            this.time = +new Date();
        }.bind(this), 50);
    }

};

'use strict';

/**
 * @param {EventEmitter} emitter
 * @constructor
 */
xss.ServerTicker = function(emitter) {
    this.emitter = emitter;
    this.tick();
};

xss.ServerTicker.prototype = {

    destruct: function() {
        clearInterval(this.interval);
    },

    tick: function() {
        this.time = +new Date();
        this.interval = setInterval(function() {
            this.emitter.emit(xss.SERVER_TICK, new Date() - this.time);
            this.time = +new Date();
        }.bind(this), 50);
    }

};

'use strict';

/**
 * @param {EventEmitter} emitter
 * @constructor
 * @todo Implement in room
 */
xss.game.MainLoop = function(emitter) {
    this.emitter = emitter;
    this.tick();
};

xss.game.MainLoop.prototype = {

    destruct: function() {
        clearInterval(this.interval);
    },

    tick: function() {
        this.time = +new Date();
        this.interval = setInterval(function() {
            this.emitter.emit(xss.SEVENT_SERVER_TICK, new Date() - this.time);
            this.time = +new Date();
        }.bind(this), 50);
    }

};

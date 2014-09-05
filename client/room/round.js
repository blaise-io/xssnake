'use strict';

/**
 * @param {xss.room.PlayerRegistry} players
 * @param {xss.level.Level} level
 * @constructor
 */
xss.room.Round = function(players, level) {
    this.game = new xss.game.Game(players, level);
    
    xss.event.on(
        xss.EVENT_ROUND_COUNTDOWN,
        xss.NS_ROUND,
        this.countdown.bind(this)
    );

    xss.event.on(
        xss.EVENT_ROUND_START,
        xss.NS_ROUND,
        this.start.bind(this)
    );
};

xss.room.Round.prototype = {

    destruct: function() {
        xss.event.off(
            xss.EVENT_ROUND_COUNTDOWN,
            xss.NS_ROUND
        );
        xss.event.off(
            xss.EVENT_ROUND_START,
            xss.NS_ROUND
        );
    },

    countdown: function() {
        var dialog, updateShape, timer, from = xss.TIME_ROUND_COUNTDOWN;

        function getBody() {
            return xss.util.format(xss.COPY_COUNTDOWN_BODY, from);
        }

        dialog = new xss.Dialog(xss.COPY_COUNTDOWN_TITLE, getBody());

        updateShape = function() {
            if (--from > 0) {
                dialog.setBody(getBody());
            } else {
                dialog.destruct();
                clearTimeout(timer);
            }
        };

        timer = window.setInterval(updateShape, 1000);
    },

    start: function() {
        this.game.start();
    }

};

'use strict';

/**
 * @param {xss.room.PlayerRegistry} players
 * @param {xss.room.Player} winner
 * @constructor
 */
xss.ui.WrapupGame = function(players, winner) {
    this.players = players;
    this.winner = winner;

    this.dialog = null;

    this.countdownStarted = new Date();
    this.countdownInterval = null;

    this.showCountdown();
};

xss.ui.WrapupGame.prototype = {

    destruct: function() {
        clearInterval(this.countdownInterval);
        this.players = null;
        this.winner = null;
        if (this.dialog) {
            this.dialog.destruct();
            this.dialog = null;
        }
    },

    getCountdownRemaining: function() {
        var remaining = this.winner ?
            xss.SECONDS_ROUND_GLOAT :
            xss.SECONDS_ROUND_PAUSE;
        remaining -= (+new Date() - this.countdownStarted) / 1000;
        return Math.max(0, Math.round(remaining));
    },

    getBody: function() {
        return xss.util.format(
            xss.COPY_ROUND_NEW_BODY,
            this.getCountdownRemaining()
        );
    },

    showCountdown: function() {
        var title = this.winner ?
            xss.util.format(xss.COPY_ROUND_WINNER_TITLE, String(this.winner.name)) :
            xss.COPY_ROUND_DRAW_TITLE;

        this.dialog = new xss.Dialog(title, this.getBody(), {
            keysBlocked: false,
            width: 100
        });

        this.countdownInterval = setInterval(function() {
            xss.audio.play('menu_alt');
            this.dialog.setBody(this.getBody());
        }.bind(this), 1000);
    }

};

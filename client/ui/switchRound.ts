/**
 * @param {room.PlayerRegistry} players
 * @param {room.Player} winner
 * @constructor
 */
export class WrapupGame {
    constructor(WrapupGame) {
    this.players = players;
    this.winner = winner;

    this.dialog = null;

    this.countdownStarted = new Date();
    this.countdownInterval = null;

    this.showCountdown();
};



    destruct() {
        clearInterval(this.countdownInterval);
        this.players = null;
        this.winner = null;
        if (this.dialog) {
            this.dialog.destruct();
            this.dialog = null;
        }
    },

    getCountdownRemaining() {
        var remaining = this.winner ?
            SECONDS_ROUND_GLOAT :
            SECONDS_ROUND_PAUSE;
        remaining -= (+new Date() - this.countdownStarted) / 1000;
        return Math.max(0, Math.round(remaining));
    },

    getBody() {
        return format(
            COPY_ROUND_NEW_BODY,
            this.getCountdownRemaining()
        );
    },

    showCountdown() {
        var title = this.winner ?
            format(COPY_ROUND_WINNER_TITLE, String(this.winner.name)) :
            COPY_ROUND_DRAW_TITLE;

        this.dialog = new Dialog(title, this.getBody(), {
            keysBlocked: false,
            width: 100
        });

        this.countdownInterval = setInterval(function() {
            State.audio.play('menu_alt');
            this.dialog.setBody(this.getBody());
        }.bind(this), 1000);
    }

};

/**
 * @param {room.PlayerRegistry} players
 * @param {room.Options} options
 * @constructor
 */
export class ui.PreGame {
    constructor(players, options) {
    this.players = players;
    this.options = options;

    this.dialog = null;

    this.countdownStarted = null;
    this.countdownInterval = null;
    this.confirmExit = false;
    this.confirmStart = false;

    this.bindKeys();
    this.updateUI();
};



    destruct() {
        clearInterval(this.countdownInterval);
        this.unbindKeys();
        this.players = null;
        this.options = null;
        if (this.dialog) {
            this.dialog.destruct();
        }
    },

    bindKeys() {
        State.events.on(DOM_EVENT_KEYDOWN, NS_PRE_GAME, this.handleKeys.bind(this));
    },

    unbindKeys() {
        State.events.off(DOM_EVENT_KEYDOWN, NS_PRE_GAME);
    },

    handleKeys(ev) {
        if (State.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case KEY_BACKSPACE:
            case KEY_ESCAPE:
                this.confirmExit = true;
                this.updateUI();
                break;
            case KEY_START:
                if (this.playerCanStartRound()) {
                    this.confirmStart = true;
                    this.updateUI();
                }
                break;
        }
    },

    updateUI() {
        if (this.dialog) {
            this.dialog.destruct();
        }
        if (this.confirmExit) {
            this.showConfirmExitDialog();
        } else if (this.confirmStart) {
            this.showConfirmStartDialog();
        } else if (this.countdownStarted) {
            this.showCountdown();
        } else {
            this.showInvitePlayersDialog();
        }
    },

    hideConfirmDialog() {
        this.confirmExit = false;
        this.confirmStart = false;
        this.updateUI();
    },

    playerCanStartRound() {
        return this.players.getTotal() > 1 && this.players.localPlayerIsHost();
    },

    showInvitePlayersDialog() {
        var numplayers, remaining, body;

        numplayers = this.players.getTotal();
        remaining = this.options.maxPlayers - numplayers;

        body = COPY_AWAITING_PLAYERS_BODY;
        body = format(body, remaining, pluralize(remaining));

        if (this.playerCanStartRound()) {
            body += '\n\n' + COPY_AWAITING_PLAYERS_START_NOW;
        }

        this.dialog = new Dialog(COPY_AWAITING_PLAYERS_HEADER, body, {
            keysBlocked: false
        });
    },

    showConfirmExitDialog() {
        var settings = {
            type  : Dialog.TYPE.CONFIRM,
            cancel: this.hideConfirmDialog.bind(this),
            ok    : function() {
                this.destruct();
                State.flow.restart();
            }.bind(this)
        };

        this.dialog = new Dialog(
             COPY_CONFIRM_EXIT_HEADER,
             this.players.getTotal() === 2 ?
                 COPY_CONFIRM_EXIT_BODY_DRAMATIC :
                 COPY_CONFIRM_EXIT_BODY,
             settings
        );
    },

    showConfirmStartDialog() {
        var settings = {
            type  : Dialog.TYPE.CONFIRM,
            cancel: this.hideConfirmDialog.bind(this),
            ok    : function() {
                State.player.emit(NC_ROOM_START);
                this.hideConfirmDialog();
            }.bind(this)
        };

        this.dialog = new Dialog(
            COPY_CONFIRM_START_HEADER,
            COPY_CONFIRM_START_BODY,
            settings
        );
    },

    /**
     * @param {boolean} started
     */
    toggleCountdown(started) {
        if (started) {
            this.countdownStarted = new Date();
        } else {
            this.countdownStarted = null;
            clearInterval(this.countdownInterval);
        }
    },

    getCountdownRemaining() {
        var remaining = SECONDS_ROUND_COUNTDOWN;
        remaining -= (+new Date() - this.countdownStarted) / 1000;
        return Math.max(0, Math.round(remaining));
    },

    startCountdownTimer() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        this.countdownInterval = setInterval(function() {
            State.audio.play('menu_alt');
            // Prevent re-creating dialog which destroys button selection.
            if (!this.confirmExit) {
                this.updateUI();
            }
        }.bind(this), 1000);
    },

    showCountdown() {
        var body = format(
            COPY_COUNTDOWN_BODY,
            this.getCountdownRemaining()
        );
        this.startCountdownTimer();
        this.dialog = new Dialog(COPY_COUNTDOWN_TITLE, body, {
            keysBlocked: false
        });
    }

};

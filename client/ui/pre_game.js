'use strict';

/**
 * @param {xss.room.PlayerRegistry} players
 * @param {xss.room.Options} options
 * @constructor
 */
xss.ui.PreGame = function(players, options) {
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

xss.ui.PreGame.prototype = {

    destruct: function() {
        clearInterval(this.countdownInterval);
        this.unbindKeys();
        this.players = null;
        this.options = null;
        if (this.dialog) {
            this.dialog.destruct();
        }
    },

    bindKeys: function() {
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_PRE_GAME, this.handleKeys.bind(this));
    },

    unbindKeys: function() {
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_PRE_GAME);
    },

    handleKeys: function(ev) {
        if (xss.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case xss.KEY_BACKSPACE:
            case xss.KEY_ESCAPE:
                this.confirmExit = true;
                this.updateUI();
                break;
            case xss.KEY_START:
                if (this.playerCanStartRound()) {
                    this.confirmStart = true;
                    this.updateUI();
                }
                break;
        }
    },

    updateUI: function() {
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

    hideConfirmDialog: function() {
        this.confirmExit = false;
        this.confirmStart = false;
        this.updateUI();
    },

    playerCanStartRound: function() {
        return this.players.getTotal() > 1 && this.players.localPlayerIsHost();
    },

    showInvitePlayersDialog: function() {
        var numplayers, remaining, body;

        numplayers = this.players.getTotal();
        remaining = this.options.maxPlayers - numplayers;

        body = xss.COPY_AWAITING_PLAYERS_BODY;
        body = xss.util.format(body, remaining, xss.util.pluralize(remaining));

        if (this.playerCanStartRound()) {
            body += '\n\n' + xss.COPY_AWAITING_PLAYERS_START_NOW;
        }

        this.dialog = new xss.Dialog(xss.COPY_AWAITING_PLAYERS_HEADER, body, {
            keysBlocked: false
        });
    },

    showConfirmExitDialog: function() {
        var settings = {
            type  : xss.Dialog.TYPE.CONFIRM,
            cancel: this.hideConfirmDialog.bind(this),
            ok    : function() {
                this.destruct();
                xss.flow.restart();
            }.bind(this)
        };

        this.dialog = new xss.Dialog(
             xss.COPY_CONFIRM_EXIT_HEADER,
             this.players.getTotal() === 2 ?
                 xss.COPY_CONFIRM_EXIT_BODY_DRAMATIC :
                 xss.COPY_CONFIRM_EXIT_BODY,
             settings
        );
    },

    showConfirmStartDialog: function() {
        var settings = {
            type  : xss.Dialog.TYPE.CONFIRM,
            cancel: this.hideConfirmDialog.bind(this),
            ok    : function() {
                xss.player.emit(xss.NC_ROOM_START);
                this.hideConfirmDialog();
            }.bind(this)
        };

        this.dialog = new xss.Dialog(
            xss.COPY_CONFIRM_START_HEADER,
            xss.COPY_CONFIRM_START_BODY,
            settings
        );
    },

    /**
     * @param {boolean} started
     */
    toggleCountdown: function(started) {
        if (started) {
            this.countdownStarted = new Date();
        } else {
            this.countdownStarted = null;
            clearInterval(this.countdownInterval);
        }
    },

    getCountdownRemaining: function() {
        var remaining = xss.SECONDS_ROUND_COUNTDOWN;
        remaining -= (+new Date() - this.countdownStarted) / 1000;
        return Math.max(0, Math.round(remaining));
    },

    startCountdownTimer: function() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        this.countdownInterval = setInterval(function() {
            xss.audio.play('menu_alt');
            // Prevent re-creating dialog which destroys button selection.
            if (!this.confirmExit) {
                this.updateUI();
            }
        }.bind(this), 1000);
    },

    showCountdown: function() {
        var body = xss.util.format(
            xss.COPY_COUNTDOWN_BODY,
            this.getCountdownRemaining()
        );
        this.startCountdownTimer();
        this.dialog = new xss.Dialog(xss.COPY_COUNTDOWN_TITLE, body, {
            keysBlocked: false
        });
    }

};

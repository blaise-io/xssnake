import { NC_ROOM_START, SECONDS_ROUND_COUNTDOWN } from "../../shared/const";
import { Options } from "../../shared/room/options";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { DOM_EVENT_KEYDOWN, KEY_BACKSPACE, KEY_ESCAPE, KEY_START, NS_PRE_GAME } from "../const";
import {
    COPY_AWAITING_PLAYERS_BODY,
    COPY_AWAITING_PLAYERS_HEADER, COPY_AWAITING_PLAYERS_START_NOW, COPY_CONFIRM_EXIT_BODY,
    COPY_CONFIRM_EXIT_BODY_DRAMATIC, COPY_CONFIRM_EXIT_HEADER, COPY_CONFIRM_START_BODY,
    COPY_CONFIRM_START_HEADER, COPY_COUNTDOWN_BODY,
    COPY_COUNTDOWN_TITLE
} from "../copy/copy";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state/state";
import { format } from "../util/clientUtil";
import { Dialog } from "./dialog";

export class PreGameUI {
    private dialog: Dialog;
    private countdownStarted: Date;
    private countdownInterval: any;
    private confirmExit: boolean;
    private confirmStart: boolean;

    constructor(public players: ClientPlayerRegistry, public options: Options) {

        this.dialog = null;

        this.countdownStarted = null;
        this.countdownInterval = null;
        this.confirmExit = false;
        this.confirmStart = false;

        this.bindKeys();
        this.updateUI();
    }


    destruct() {
        window.clearInterval(this.countdownInterval);
        this.unbindKeys();
        this.players = null;
        this.options = null;
        if (this.dialog) {
            this.dialog.destruct();
        }
    }

    bindKeys() {
        State.events.on(DOM_EVENT_KEYDOWN, NS_PRE_GAME, this.handleKeys.bind(this));
    }

    unbindKeys() {
        State.events.off(DOM_EVENT_KEYDOWN, NS_PRE_GAME);
    }

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
    }

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
    }

    hideConfirmDialog() {
        this.confirmExit = false;
        this.confirmStart = false;
        this.updateUI();
    }

    playerCanStartRound() {
        return this.players.getTotal() > 1 && this.players.localPlayerIsHost();
    }

    showInvitePlayersDialog() {
        const numplayers = this.players.getTotal();
        const remaining = this.options.maxPlayers - numplayers;
        let body = format(COPY_AWAITING_PLAYERS_BODY, remaining, remaining === 1 ? "" : "s");

        if (this.playerCanStartRound()) {
            body += '\n\n' + COPY_AWAITING_PLAYERS_START_NOW;
        }

        this.dialog = new Dialog(COPY_AWAITING_PLAYERS_HEADER, body, {
            keysBlocked: false
        });
    }

    showConfirmExitDialog() {
        const settings = {
            type: Dialog.TYPE.CONFIRM,
            cancel: this.hideConfirmDialog.bind(this),
            ok: function() {
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
    }

    showConfirmStartDialog() {
        const settings = {
            type: Dialog.TYPE.CONFIRM,
            cancel: this.hideConfirmDialog.bind(this),
            ok: function() {
                State.player.emit(NC_ROOM_START);
                this.hideConfirmDialog();
            }.bind(this)
        };

        this.dialog = new Dialog(
            COPY_CONFIRM_START_HEADER,
            COPY_CONFIRM_START_BODY,
            settings
        );
    }

    /**
     * @param {boolean} started
     */
    toggleCountdown(started) {
        if (started) {
            this.countdownStarted = new Date();
        } else {
            this.countdownStarted = null;
            window.clearInterval(this.countdownInterval);
        }
    }

    getCountdownRemaining() {
        let remaining = SECONDS_ROUND_COUNTDOWN;
        remaining -= (+new Date() - +this.countdownStarted) / 1000;
        return Math.max(0, Math.round(remaining));
    }

    startCountdownTimer() {
        if (this.countdownInterval) {
            window.clearInterval(this.countdownInterval);
        }
        this.countdownInterval = window.setInterval(function() {
            State.audio.play('menu_alt');
            // Prevent re-creating dialog which destroys button selection.
            if (!this.confirmExit) {
                this.updateUI();
            }
        }.bind(this), 1000);
    }

    showCountdown() {
        const body = format(
            COPY_COUNTDOWN_BODY,
            this.getCountdownRemaining()
        );
        this.startCountdownTimer();
        this.dialog = new Dialog(COPY_COUNTDOWN_TITLE, body, {
            keysBlocked: false
        });
    }

}

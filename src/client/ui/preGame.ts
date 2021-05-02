import { NC_ROOM_START, SECONDS_ROUND_COUNTDOWN } from "../../shared/const";
import { RoomOptions } from "../../shared/room/roomOptions";
import { KEY, NS } from "../const";
import {
    COPY_AWAITING_PLAYERS_BODY,
    COPY_AWAITING_PLAYERS_HEADER,
    COPY_AWAITING_PLAYERS_START_NOW,
    COPY_CONFIRM_EXIT_BODY,
    COPY_CONFIRM_EXIT_BODY_DRAMATIC,
    COPY_CONFIRM_EXIT_HEADER,
    COPY_CONFIRM_START_BODY,
    COPY_CONFIRM_START_HEADER,
    COPY_COUNTDOWN_BODY,
    COPY_COUNTDOWN_TITLE,
} from "../copy/copy";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state";
import { format } from "../util/clientUtil";
import { Dialog, DialogType } from "./dialog";

export class PreGameUI {
    private dialog: Dialog;
    private countdownStarted: Date;
    private countdownInterval: number;
    private confirmExit: boolean;
    private confirmStart: boolean;

    constructor(public players: ClientPlayerRegistry, public options: RoomOptions) {
        this.dialog = undefined;

        this.countdownStarted = undefined;
        this.countdownInterval = undefined;
        this.confirmExit = false;
        this.confirmStart = false;

        this.bindKeys();
        this.updateUI();
    }

    destruct(): void {
        window.clearInterval(this.countdownInterval);
        this.unbindKeys();
        this.players = undefined;
        this.options = undefined;
        if (this.dialog) {
            this.dialog.destruct();
        }
    }

    bindKeys(): void {
        State.events.on("keydown", NS.PRE_GAME, this.handleKeys.bind(this));
    }

    unbindKeys(): void {
        State.events.off("keydown", NS.PRE_GAME);
    }

    handleKeys(event: KeyboardEvent): void {
        if (State.keysBlocked) {
            return;
        }
        switch (event.key) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
                this.confirmExit = true;
                this.updateUI();
                break;
            case KEY.START:
                if (this.playerCanStartRound()) {
                    this.confirmStart = true;
                    this.updateUI();
                }
                break;
        }
    }

    updateUI(): void {
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

    hideConfirmDialog(): void {
        this.confirmExit = false;
        this.confirmStart = false;
        this.updateUI();
    }

    playerCanStartRound(): boolean {
        return this.players.getTotal() > 1 && this.players.localPlayerIsHost();
    }

    showInvitePlayersDialog(): void {
        const numplayers = this.players.getTotal();
        const remaining = this.options.maxPlayers - numplayers;
        let body = format(COPY_AWAITING_PLAYERS_BODY, remaining, remaining === 1 ? "" : "s");

        if (this.playerCanStartRound()) {
            body += "\n\n" + COPY_AWAITING_PLAYERS_START_NOW;
        }

        this.dialog = new Dialog(COPY_AWAITING_PLAYERS_HEADER, body, {
            keysBlocked: false,
        });
    }

    showConfirmExitDialog(): void {
        const settings = {
            type: DialogType.CONFIRM,
            cancel: this.hideConfirmDialog.bind(this),
            ok: function () {
                this.destruct();
                State.flow.restart();
            }.bind(this),
        };

        this.dialog = new Dialog(
            COPY_CONFIRM_EXIT_HEADER,
            this.players.getTotal() === 2
                ? COPY_CONFIRM_EXIT_BODY_DRAMATIC
                : COPY_CONFIRM_EXIT_BODY,
            settings,
        );
    }

    showConfirmStartDialog(): void {
        const settings = {
            type: DialogType.CONFIRM,
            cancel: this.hideConfirmDialog.bind(this),
            ok: function () {
                this.XXX.emit(NC_ROOM_START);
                this.hideConfirmDialog();
            }.bind(this),
        };

        this.dialog = new Dialog(COPY_CONFIRM_START_HEADER, COPY_CONFIRM_START_BODY, settings);
    }

    toggleCountdown(started: boolean): void {
        if (started) {
            this.countdownStarted = new Date();
        } else {
            this.countdownStarted = undefined;
            window.clearInterval(this.countdownInterval);
        }
    }

    getCountdownRemaining(): number {
        let remaining = SECONDS_ROUND_COUNTDOWN;
        remaining -= (+new Date() - +this.countdownStarted) / 1000;
        return Math.max(0, Math.round(remaining));
    }

    startCountdownTimer(): void {
        if (this.countdownInterval) {
            window.clearInterval(this.countdownInterval);
        }
        this.countdownInterval = window.setInterval(
            function () {
                State.audio.play("menu_alt");
                // Prevent re-creating dialog which destroys button selection.
                if (!this.confirmExit) {
                    this.updateUI();
                }
            }.bind(this),
            1000,
        );
    }

    showCountdown(): void {
        const body = format(COPY_COUNTDOWN_BODY, this.getCountdownRemaining());
        this.startCountdownTimer();
        this.dialog = new Dialog(COPY_COUNTDOWN_TITLE, body, {
            keysBlocked: false,
        });
    }
}

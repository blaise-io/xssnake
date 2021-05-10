import { SECONDS_ROUND_COUNTDOWN } from "../../shared/const";
import { RoomManualStartMessage } from "../../shared/room/roomMessages";
import { RoomOptions } from "../../shared/room/roomOptions";
import { _ } from "../../shared/util";
import { KEY, NS } from "../const";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state";
import { Dialog, DialogType } from "./dialog";

export class PreGameUI {
    private dialog?: Dialog;
    private countdownStarted?: Date;
    private countdownInterval?: number;
    private confirmExit: boolean;
    private confirmStart: boolean;

    constructor(public players: ClientPlayerRegistry, public options: RoomOptions) {
        // delete this.dialog;

        // delete this.countdownStarted;
        // delete this.countdownInterval;
        this.confirmExit = false;
        this.confirmStart = false;

        this.bindKeys();
        this.updateUI();
    }

    destruct(): void {
        if (this.countdownInterval) {
            window.clearInterval(this.countdownInterval);
        }
        this.unbindKeys();
        // delete this.players;
        // delete this.options;
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
        return this.players.length > 1 && this.players.localPlayerIsHost();
    }

    showInvitePlayersDialog(): void {
        const numplayers = this.players.length;
        const remaining = this.options.maxPlayers - numplayers;

        // TODO: Pluralize.
        let body = _(
            `You can fit ${remaining} more player${
                remaining !== 1 ? "s" : ""
            } in this room! Share the current page URL with your online friends to allow direct access.`,
        );

        if (this.playerCanStartRound()) {
            body += "\n\n" + _("Press S to start now.");
        }

        this.dialog = new Dialog(_("Msg your friends"), body, {
            keysBlocked: false,
        });
    }

    showConfirmExitDialog(): void {
        const settings = {
            type: DialogType.CONFIRM,
            cancel: this.hideConfirmDialog.bind(this),
            ok: () => {
                this.destruct();
                State.flow.restart();
            },
        };

        this.dialog = new Dialog(
            _("Confirm exit"),
            this.players.length === 2
                ? _("Do you REALLY want to leave that other player ALL ALONE in this room?")
                : _("Do you really want to leave this room?"),
            settings,
        );
    }

    showConfirmStartDialog(): void {
        this.dialog = new Dialog(
            _("Confirm start"),
            _("Do you really want to start the game before the room is full?"),
            {
                type: DialogType.CONFIRM,
                cancel: this.hideConfirmDialog.bind(this),
                ok: () => {
                    this.players.localPlayer.send(new RoomManualStartMessage());
                    this.hideConfirmDialog();
                },
            },
        );
    }

    toggleCountdown(started: boolean): void {
        if (started) {
            this.countdownStarted = new Date();
        } else {
            // delete this.countdownStarted;
            window.clearInterval(this.countdownInterval);
        }
    }

    getCountdownRemaining(): number {
        let remaining = SECONDS_ROUND_COUNTDOWN;
        remaining -= (new Date().getTime() - this.countdownStarted!.getTime()) / 1000;
        return Math.max(0, Math.round(remaining));
    }

    startCountdownTimer(): void {
        if (this.countdownInterval) {
            window.clearInterval(this.countdownInterval);
        }
        this.countdownInterval = window.setInterval(() => {
            State.audio.play("menu_alt");
            // Prevent re-creating dialog which destroys button selection.
            if (!this.confirmExit) {
                this.updateUI();
            }
        }, 1000);
    }

    showCountdown(): void {
        const remaining = this.getCountdownRemaining();
        const body = _(`Game starting in: ${remaining}`);
        this.startCountdownTimer();
        this.dialog = new Dialog(_("Get ready!"), body, {
            keysBlocked: false,
        });
    }
}

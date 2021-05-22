import { SECONDS_ROUND_COUNTDOWN } from "../../shared/const";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import { RoomManualStartMessage } from "../../shared/room/roomMessages";
import { RoomOptions } from "../../shared/room/roomOptions";
import { _ } from "../../shared/util";
import { KEY } from "../const";
import { EventHandler } from "../netcode/eventHandler";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state";
import { Dialog, DialogType } from "./dialog";

export class PreGameUI {
    private dialog?: Dialog;
    private countdownStarted?: Date;
    private countdownInterval?: number;
    private confirmExit = false;
    private confirmStart = false;
    private eventHandler = new EventHandler();

    constructor(public players: ClientPlayerRegistry, public options: RoomOptions) {
        this.updateUI();
        this.eventHandler.on("keydown", (event: KeyboardEvent) => {
            this.handleKeys(event);
        });
        this.eventHandler.on(PlayersMessage.id, () => {
            setTimeout(() => {
                this.updateUI();
            }, 0);
        });
    }

    destruct(): void {
        if (this.countdownInterval) {
            window.clearInterval(this.countdownInterval);
        }
        this.eventHandler.destruct();
        this.dialog?.destruct();
        this.eventHandler.destruct();
    }

    handleKeys(event: KeyboardEvent): void {
        if (State.keysBlocked) {
            return;
        }
        if (event.key === KEY.BACKSPACE || event.key === KEY.ESCAPE) {
            this.confirmExit = true;
            this.updateUI();
        } else if (this.playerIsAdmin && event.key === KEY.START) {
            this.confirmStart = true;
            this.updateUI();
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

    get playerIsAdmin(): boolean {
        return this.players[0].local;
    }

    showInvitePlayersDialog(): void {
        const numplayers = this.players.length;
        const remaining = this.options.maxPlayers - numplayers;

        let body = _(
            `You can fit ${remaining} more player${
                remaining !== 1 ? "s" : ""
            } in this room! Share the current page URL with your online friends to allow direct access.`,
        );

        if (this.playerIsAdmin) {
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
        remaining -= (new Date().getTime() - (this.countdownStarted as Date).getTime()) / 1000;
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

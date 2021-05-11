import { SECONDS_ROUND_GLOAT, SECONDS_ROUND_PAUSE } from "../../shared/const";
import { Player } from "../../shared/room/player";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { _ } from "../../shared/util";
import { State } from "../state";
import { Dialog } from "./dialog";

export class WrapupGame {
    private dialog: Dialog;
    private countdownInterval: number;
    private countdownStarted = new Date();

    constructor(public players: PlayerRegistry<Player>, public winner: Player) {
        this.dialog = this.getCountdownDialog();

        this.countdownInterval = window.setInterval(() => {
            State.audio.play("menu_alt");
            this.dialog.body = this.body;
        }, 100);
    }

    destruct(): void {
        window.clearInterval(this.countdownInterval);
        this.dialog?.destruct();
    }

    private get body(): string {
        return _(`New round starting in: ${this.countdownRemaining}`);
    }

    private get countdownRemaining(): number {
        let remaining = this.winner ? SECONDS_ROUND_GLOAT : SECONDS_ROUND_PAUSE;
        remaining -= (+new Date() - +this.countdownStarted) / 1000;
        return Math.max(0, Math.round(remaining));
    }

    private getCountdownDialog(): Dialog {
        const title = this.winner ? _(`${this.winner.name} won!`) : _("Round ended in a draw");

        return new Dialog(title, this.body, {
            keysBlocked: false,
            width: 100,
        });
    }
}

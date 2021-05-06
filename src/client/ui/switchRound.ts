import { SECONDS_ROUND_GLOAT, SECONDS_ROUND_PAUSE } from "../../shared/const";
import { Player } from "../../shared/room/player";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { _ } from "../../shared/util";
import { ClientPlayer } from "../room/clientPlayer";
import { State } from "../state";
import { Dialog } from "./dialog";

export class WrapupGame {
    private dialog: Dialog;
    private countdownStarted: Date;
    private countdownInterval: number;

    constructor(public players: PlayerRegistry<ClientPlayer>, public winner: Player) {
        delete this.dialog;

        this.countdownStarted = new Date();
        delete this.countdownInterval;

        this.showCountdown();
    }

    destruct(): void {
        window.clearInterval(this.countdownInterval);
        delete this.players;
        delete this.winner;
        if (this.dialog) {
            this.dialog.destruct();
            delete this.dialog;
        }
    }

    getCountdownRemaining(): number {
        let remaining = this.winner ? SECONDS_ROUND_GLOAT : SECONDS_ROUND_PAUSE;
        remaining -= (+new Date() - +this.countdownStarted) / 1000;
        return Math.max(0, Math.round(remaining));
    }

    getBody(): string {
        return _(`New round starting in: ${this.getCountdownRemaining()}`);
    }

    showCountdown(): void {
        const title = this.winner ? _(`${this.winner.name} won!`) : _("Round ended in a draw");

        this.dialog = new Dialog(title, this.getBody(), {
            keysBlocked: false,
            width: 100,
        });

        this.countdownInterval = window.setInterval(
            function () {
                State.audio.play("menu_alt");
                this.dialog.body = this.getBody();
            }.bind(this),
            1000,
        );
    }
}

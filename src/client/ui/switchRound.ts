import { SECONDS_ROUND_GLOAT, SECONDS_ROUND_PAUSE } from "../../shared/const";
import { Player } from "../../shared/room/player";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { COPY_ROUND_DRAW_TITLE, COPY_ROUND_NEW_BODY, COPY_ROUND_WINNER_TITLE } from "../copy/copy";
import { ClientPlayer } from "../room/clientPlayer";
import { State } from "../state";
import { format } from "../util/clientUtil";
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
        return format(COPY_ROUND_NEW_BODY, this.getCountdownRemaining());
    }

    showCountdown(): void {
        const title = this.winner
            ? format(COPY_ROUND_WINNER_TITLE, String(this.winner.name))
            : COPY_ROUND_DRAW_TITLE;

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

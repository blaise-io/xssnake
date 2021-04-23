import { PLAYER_NAME_MAXWIDTH, PLAYER_NAME_MINLENGTH } from "../../shared/const";
import { levelsets } from "../../shared/data/levelsets";
import { _ } from "../../shared/util";
import { STORAGE_NAME, UC } from "../const";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { GameStage } from "./base/gameStage";
import { InputStage } from "./base/inputStage";
import { format } from "../util/clientUtil";
import { ChallengeStage } from "./challenge";

export class AutoJoinStage extends InputStage {
    header = _("JOiN GAME");
    name = STORAGE_NAME;
    minlength = PLAYER_NAME_MINLENGTH;
    maxwidth = PLAYER_NAME_MAXWIDTH;

    constructor(public clientPlayer: ClientSocketPlayer) {
        super();
        // TODO: Need to remember flow.
        this.next = this.clientPlayer.room.options.isXSS ? ChallengeStage : GameStage;
        this.label = this.getLabel();
    }

    private getLabel() {
        const summary = [];
        const room = this.clientPlayer.room;
        const names = room.players.getNames().join(", ");

        summary.push(format(_("Players ({0})"), room.players.getTotal()) + "\t" + names);
        summary.push(_("Max. players") + "\t" + room.options.maxPlayers);
        summary.push(_("Level Set") + "\t" + levelsets[room.options.levelsetIndex].title);
        summary.push(_("Power-Ups") + "\t" + room.options.hasPowerups ? UC.YES : UC.NO);
        summary.push(_("Winner fires XSS") + "\t" + room.options.isXSS ? UC.YES : UC.NO);
        return summary.join("\n") + "\n\n" + _("Enter your name to join: ");
    }
}

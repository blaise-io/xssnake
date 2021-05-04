import { PLAYER_NAME_MAXWIDTH, PLAYER_NAME_MINLENGTH } from "../../shared/const";
import { levelsets } from "../../shared/data/levelsets";
import { _ } from "../../shared/util";
import { STORAGE, UC } from "../const";
import { State } from "../state";
import { GameStage } from "./base/gameStage";
import { InputStage } from "./base/inputStage";
import { format } from "../util/clientUtil";
import { ChallengeStage } from "./challenge";

export class AutoJoinStage extends InputStage {
    header = _("JOiN GAME");
    name = STORAGE.NAME;
    minlength = PLAYER_NAME_MINLENGTH;
    maxwidth = PLAYER_NAME_MAXWIDTH;
    next = undefined;
    label = undefined;

    constructor() {
        super();
        this.next = State.flow.data.room.options.isXSS ? ChallengeStage : GameStage;
        this.label = this.getLabel();
        this.shape = this.getLabelAndValueShape();
    }

    private getLabel() {
        const summary = [];
        const room = State.flow.data.room;
        const names = room.players.getNames().join(", ");

        summary.push(format(_("Players ({0})"), room.players.length) + "\t" + names);
        summary.push(_("Max. players") + "\t" + room.options.maxPlayers);
        summary.push(_("Level Set") + "\t" + levelsets[room.options.levelsetIndex].title);
        summary.push(_("Power-Ups") + "\t" + room.options.hasPowerups ? UC.YES : UC.NO);
        summary.push(_("Winner fires XSS") + "\t" + room.options.isXSS ? UC.YES : UC.NO);

        return summary.join("\n") + "\n\n" + _("Enter your name to join: ");
    }

    inputSubmit(error: string, value: string, top: number): void {
        State.flow.data.name = value;
        super.inputSubmit(error, value, top);
    }
}

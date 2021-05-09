import { PLAYER_NAME_MAXWIDTH, PLAYER_NAME_MINLENGTH } from "../../shared/const";
import { levelSets } from "../../shared/levelSet/levelSets";
import { _ } from "../../shared/util";
import { STORAGE } from "../const";
import { ClientRoom } from "../room/clientRoom";
import { State } from "../state";
import { GameStage } from "./base/gameStage";
import { InputStage } from "./base/inputStage";
import { stylizeUpper } from "../util/clientUtil";
import { ChallengeStage } from "./challenge";

export class AutoJoinStage extends InputStage {
    header = stylizeUpper(_("Join game"));
    name = STORAGE.NAME;
    minlength = PLAYER_NAME_MINLENGTH;
    maxwidth = PLAYER_NAME_MAXWIDTH;
    next = State.flow.data.room!.options.isXSS ? ChallengeStage : GameStage;
    label = this.getLabel();
    shape = this.getLabelAndValueShape();

    private getLabel() {
        const summary = [];
        const room = State.flow.data.room as ClientRoom;
        const names = room.players.getNames();

        this.header = stylizeUpper(_(`Join ${names[0]}'s game`));

        summary.push(`${_("Players")} (${room.players.length})\t${names.join(", ")}`);
        summary.push(`${_("Max. players")}\t${room.options.maxPlayers}`);
        summary.push(`${_("Level set")}\t${levelSets[room.options.levelSetIndex].title}`);
        summary.push(`${_("Power-ups")}\t${room.options.hasPowerups ? _("Yes") : _("Yes")}`);
        summary.push(`${_("Winner fires XSS")}\t${room.options.isXSS ? _("No") : _("No")}`);

        return summary.join("\n") + "\n\n" + _("Enter your name to join: ");
    }

    inputSubmit(error: string, value: string, top: number): void {
        State.flow.data.name = value;
        super.inputSubmit(error, value, top);
    }
}

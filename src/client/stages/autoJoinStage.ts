import { PLAYER_NAME_MAXWIDTH, PLAYER_NAME_MINLENGTH } from "../../shared/const";
import { levelSets } from "../../shared/levelSet/levelSets";
import { Player } from "../../shared/room/player";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { RoomOptions } from "../../shared/room/roomOptions";
import { _ } from "../../shared/util";
import { STORAGE } from "../const";
import { State } from "../state";
import { GameStage } from "./base/gameStage";
import { InputStage } from "./base/inputStage";
import { stylizeUpper } from "../util/clientUtil";
import { StageConstructor } from "./base/stage";
import { ChallengeStage } from "./challenge";

export type AutoJoinData = { players: PlayerRegistry<Player>; options: RoomOptions };

export class AutoJoinStage extends InputStage {
    header = stylizeUpper(_("Join game"));
    name = STORAGE.NAME;
    minlength = PLAYER_NAME_MINLENGTH;
    maxwidth = PLAYER_NAME_MAXWIDTH;
    label = this.getLabel();
    shape = this.getLabelAndValueShape();
    next: StageConstructor = GameStage;

    constructor() {
        super();
        this.next = State.flow.data.roomOptions.isXSS ? ChallengeStage : GameStage;
    }

    private getLabel() {
        const summary = [];
        const options = State.flow.data.roomOptions;
        const players = State.flow.data.roomPlayers;

        const names = players.map((p) => p.name);
        this.header = stylizeUpper(_(`Join ${names[0]}'s game`));

        summary.push(`${_("Players")} (${players.length})\t${names.join(", ")}`);
        summary.push(`${_("Max. players")}\t${options.maxPlayers}`);
        summary.push(`${_("Level set")}\t${levelSets[options.levelSetIndex].title}`);
        summary.push(`${_("Power-ups")}\t${options.hasPowerups ? _("Yes") : _("Yes")}`);
        summary.push(`${_("Winner fires XSS")}\t${options.isXSS ? _("No") : _("No")}`);

        return summary.join("\n") + "\n\n" + _("Enter your name to join: ");
    }

    inputSubmit(error: string, value: string, top: number): void {
        State.flow.data.name = value;
        super.inputSubmit(error, value, top);
    }
}

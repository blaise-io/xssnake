import { PLAYER_NAME_MAXWIDTH, PLAYER_NAME_MINLENGTH } from "../../shared/const";
import { levelsets } from "../../shared/data/levelsets";
import { _ } from "../../shared/util";
import { STORAGE_NAME } from "../const";
import {
    COPY_AUTOJOIN_PLAYERS,
    COPY_BOOL,
    COPY_COMMA_SPACE,
    COPY_FIELD_LEVEL_SET,
    COPY_FIELD_MAX_PLAYERS,
    COPY_FIELD_POWERUPS,
    COPY_FIELD_XSS,
} from "../copy/copy";
import { ClientRoom } from "../room/clientRoom";
import { InputStage } from "../stage_base/inputStage";
import { ClientState } from "../state/clientState";
import { format } from "../util/clientUtil";
import { ChallengeStage } from "./challenge";
import { QuickJoinGame } from "./quickJoinGame";

export class AutoJoinStage extends InputStage {
    private room: ClientRoom;

    constructor() {
        super();

        this.room = ClientState.player.room;

        this.header = _("JOiN GAME");
        this.label = this.getRoomSummary();
        this.name = STORAGE_NAME;

        ClientState.flow.GameStage = QuickJoinGame;
        this.next = this.room.options.isXSS ? ChallengeStage : ClientState.flow.GameStage;

        this.minlength = PLAYER_NAME_MINLENGTH;
        this.maxwidth = PLAYER_NAME_MAXWIDTH;

        InputStage.call(this);
    }

    getRoomSummary(): string {
        const summary = [];
        summary.push(
            format(COPY_AUTOJOIN_PLAYERS, this.room.players.getTotal()) +
                "\t" +
                this.room.players.getNames().join(COPY_COMMA_SPACE)
        );
        summary.push(COPY_FIELD_MAX_PLAYERS + "\t" + this.room.options.maxPlayers);
        summary.push(
            COPY_FIELD_LEVEL_SET + "\t" + levelsets[this.room.options.levelsetIndex].title
        );
        summary.push(COPY_FIELD_POWERUPS + "\t" + COPY_BOOL[Number(this.room.options.hasPowerups)]);
        summary.push(COPY_FIELD_XSS + "\t" + COPY_BOOL[Number(this.room.options.isXSS)]);
        return summary.join("\n") + "\n\n" + _("Enter your name to join: ");
    }
}

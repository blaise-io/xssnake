import { PLAYER_NAME_MAXWIDTH, PLAYER_NAME_MINLENGTH } from "../../shared/const";
import { STORAGE_NAME } from "../const";
import {
    COPY_AUTOJOIN_ENTER_NAME,
    COPY_AUTOJOIN_PLAYERS, COPY_BOOL, COPY_COMMA_SPACE, COPY_FIELD_LEVEL_SET, COPY_FIELD_MAX_PLAYERS,
    COPY_FIELD_POWERUPS, COPY_FIELD_XSS,
} from "../copy/copy";
import { InputStage } from "../stage_base/inputStage";
import { State } from "../state/state";
import { format } from "../util/clientUtil";
import { ChallengeStage } from "./challenge";
import { QuickJoinGame } from "./quickJoinGame";

export class AutoJoinStage extends InputStage {
  private room: any;

  constructor() {
      super();

      /** @type {room.ClientRoom} */
      this.room = State.player.room;

      this.header = "JOiN GAME";
      this.label = this.getRoomSummary();
      this.name = STORAGE_NAME;

      State.flow.GameStage = QuickJoinGame;
      this.next = this.room.options.isXSS ? ChallengeStage : State.flow.GameStage;

      this.minlength = PLAYER_NAME_MINLENGTH;
      this.maxwidth = PLAYER_NAME_MAXWIDTH;

      InputStage.call(this);
  }

  getRoomSummary() {
      const summary = [];

      summary.push(
          format(
              COPY_AUTOJOIN_PLAYERS, this.room.players.getTotal()
          ) + "\t" +
      this.room.players.getNames().join(COPY_COMMA_SPACE)
      );

      summary.push(
          COPY_FIELD_MAX_PLAYERS + "\t" +
      this.room.options.maxPlayers
      );

      summary.push(
          COPY_FIELD_LEVEL_SET + "\t" +
      State.levelsetRegistry.getLevelset(this.room.options.levelset).title
      );

      summary.push(
          COPY_FIELD_POWERUPS + "\t" +
      COPY_BOOL[Number(this.room.options.hasPowerups)]
      );

      summary.push(
          COPY_FIELD_XSS + "\t" +
      COPY_BOOL[Number(this.room.options.isXSS)]
      );

      return summary.join("\n") + "\n\n" + COPY_AUTOJOIN_ENTER_NAME;
  }

}

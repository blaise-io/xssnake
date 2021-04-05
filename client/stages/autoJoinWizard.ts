/**
 * @param {string} roomKey
 * @constructor
 */
import {
    NC_OPTIONS_SERIALIZE, NC_PLAYERS_SERIALIZE, NC_ROOM_JOIN_ERROR, NC_ROOM_SERIALIZE, NC_ROOM_STATUS,
} from "../../shared/const";
import { NS_STAGES } from "../const";
import {
    COPY_AUTOJOIN_CONNECTING, COPY_AUTOJOIN_FETCHING, COPY_AUTOJOIN_HEADER, COPY_ERROR,
} from "../copy/copy";
import { ClientRoom } from "../room/clientRoom";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { State } from "../state/state";
import { Dialog } from "../ui/dialog";
import { error } from "../util/clientUtil";
import { AutoJoinStage } from "./autoJoin";

export class AutoJoinWizard {
  roomKey: any;
  dialog: Dialog;
  eventsReceived: number;

  constructor(roomKey) {
      this.roomKey = roomKey;
      this.dialog = this.getInitialDialog();
      this.autoJoinRoom();
  }

  getInitialDialog() {
      return new Dialog(
          COPY_AUTOJOIN_HEADER, COPY_AUTOJOIN_CONNECTING
      );
  }

  autoJoinRoom() {
      State.player = new ClientSocketPlayer(
          this.onconnect.bind(this)
      );
  }

  onconnect() {
      window.setTimeout(function() {
          this.dialog.setBody(COPY_AUTOJOIN_FETCHING);
          window.setTimeout(this.getAutoJoinRoomStatus.bind(this), 500);
      }.bind(this), 500);

      this.bindEvents();
  }

  getAutoJoinRoomStatus() {
      State.player.emit(NC_ROOM_STATUS, [this.roomKey]);
  }

  bindEvents() {
      // Use room to store data until player confirms join.
      State.player.room = new ClientRoom();
      this.eventsReceived = 0;

      State.events.on(
          NC_ROOM_SERIALIZE,
          NS_STAGES,
          this.checkAllRoomDataReceived.bind(this)
      );

      State.events.on(
          NC_OPTIONS_SERIALIZE,
          NS_STAGES,
          this.checkAllRoomDataReceived.bind(this)
      );

      State.events.on(
          NC_PLAYERS_SERIALIZE,
          NS_STAGES,
          this.checkAllRoomDataReceived.bind(this)
      );

      State.events.on(
          NC_ROOM_JOIN_ERROR,
          NS_STAGES,
          this.handleError.bind(this)
      );
  }

  unbindEvents() {
      State.events.off(NC_ROOM_SERIALIZE, NS_STAGES);
      State.events.off(NC_OPTIONS_SERIALIZE, NS_STAGES);
      State.events.off(NC_PLAYERS_SERIALIZE, NS_STAGES);
      State.events.off(NC_ROOM_JOIN_ERROR, NS_STAGES);
  }

  checkAllRoomDataReceived() {
      // Need room, room options and room players.
      if (++this.eventsReceived === 3) {
          this.dialog.destruct();
          this.unbindEvents();
          State.flow.switchStage(AutoJoinStage);
      }
  }

  handleError(data) {
      this.dialog.destruct();
      this.unbindEvents();
      error(COPY_ERROR[data[0]]);
      State.player = null;
  }

}

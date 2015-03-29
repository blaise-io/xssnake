'use strict';

/**
 * @param {string} roomKey
 * @constructor
 */
xss.stage.AutoJoinWizard = function(roomKey) {
    this.roomKey = roomKey;
    this.dialog = this.getInitialDialog();
    this.autoJoinRoom();
};

xss.stage.AutoJoinWizard.prototype = {

    getInitialDialog: function() {
        return new xss.Dialog(
            xss.COPY_AUTOJOIN_HEADER, xss.COPY_AUTOJOIN_CONNECTING
        );
    },

    autoJoinRoom: function() {
        xss.player = new xss.room.ClientSocketPlayer(
            this.onconnect.bind(this)
        );
    },

    onconnect: function() {
        window.setTimeout(function() {
            this.dialog.setBody(xss.COPY_AUTOJOIN_FETCHING);
            window.setTimeout(this.getAutoJoinRoomStatus.bind(this), 500);
        }.bind(this), 500);

        this.bindEvents();
    },

    getAutoJoinRoomStatus: function() {
        xss.player.emit(xss.NC_ROOM_STATUS, [this.roomKey]);
    },

    bindEvents: function() {
        // Use room to store data until player confirms join.
        xss.player.room = new xss.room.ClientRoom();
        this.eventsReceived = 0;

        xss.event.on(
            xss.NC_ROOM_SERIALIZE,
            xss.NS_STAGES,
            this.checkAllRoomDataReceived.bind(this)
        );

        xss.event.on(
            xss.NC_OPTIONS_SERIALIZE,
            xss.NS_STAGES,
            this.checkAllRoomDataReceived.bind(this)
        );

        xss.event.on(
            xss.NC_PLAYERS_SERIALIZE,
            xss.NS_STAGES,
            this.checkAllRoomDataReceived.bind(this)
        );

        xss.event.on(
            xss.NC_ROOM_JOIN_ERROR,
            xss.NS_STAGES,
            this.handleError.bind(this)
        );
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_ROOM_SERIALIZE, xss.NS_STAGES);
        xss.event.off(xss.NC_OPTIONS_SERIALIZE, xss.NS_STAGES);
        xss.event.off(xss.NC_PLAYERS_SERIALIZE, xss.NS_STAGES);
        xss.event.off(xss.NC_ROOM_JOIN_ERROR, xss.NS_STAGES);
    },

    checkAllRoomDataReceived: function() {
        // Need room, room options and room players.
        if (++this.eventsReceived === 3) {
            this.dialog.destruct();
            this.unbindEvents();
            xss.flow.switchStage(xss.AutoJoinStage);
        }
    },

    handleError: function(data) {
        this.dialog.destruct();
        this.unbindEvents();
        xss.util.error(xss.COPY_ERROR[data[0]]);
        xss.player = null;
    }

};

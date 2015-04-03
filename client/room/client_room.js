'use strict';

/**
 * @constructor
 */
xss.room.ClientRoom = function() {
    this.key = '';

    this.players = new xss.room.ClientPlayerRegistry();
    this.options = new xss.room.ClientOptions();
    this.roundSet = new xss.room.ClientRoundSet(this.players, this.options);

    this.messageBox = null;
    this.scoreboard = null;

    this.bindEvents();
};

xss.room.ClientRoom.prototype = {

    destruct: function() {
        xss.util.hash();
        this.unbindEvents();
        this.players.destruct();
        this.options.destruct();
        this.roundSet.destruct();
        this.messageBox.destruct();
        this.scoreboard.destruct();
    },

    bindEvents: function() {
        xss.event.on(xss.NC_ROOM_SERIALIZE, xss.NS_ROOM, this.setRoom.bind(this));
        xss.event.on(xss.NC_OPTIONS_SERIALIZE, xss.NS_ROOM, this.updateOptions.bind(this));
        xss.event.on(xss.NC_PLAYERS_SERIALIZE, xss.NS_ROOM, this.updatePlayers.bind(this));

        // TODO: Move to a new notifier class
        xss.event.on(xss.NC_SNAKE_CRASH, xss.NS_ROOM, this.ncNotifySnakesCrashed.bind(this));

        //xss.event.on(xss.NC_XSS, xss.NS_ROOM, this._requestXss.bind(this));
        //xss.event.on(xss.NC_XSS, xss.NS_ROOM, this._evalXss.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_ROOM_SERIALIZE, xss.NS_ROOM);
        xss.event.off(xss.NC_OPTIONS_SERIALIZE, xss.NS_ROOM);
        xss.event.off(xss.NC_PLAYERS_SERIALIZE, xss.NS_ROOM);
    },

    setupComponents: function() {
        this.roundSet.setupRound();
        this.scoreboard = new xss.room.Scoreboard(this.players);
        this.messageBox = new xss.room.MessageBox(this.players);
    },

    setRoom: function(serializedRoom) {
        this.key = serializedRoom[0];
        xss.util.hash(xss.HASH_ROOM, this.key);
    },

    updateOptions: function(serializedOptions) {
        this.options.deserialize(serializedOptions);
    },

    updatePlayers: function(serializedPlayers) {
        if (this.roundSet.round && this.roundSet.round.isMidgame()) {
            this.players.deserialize(serializedPlayers);
        } else {
            this.players.reconstruct(serializedPlayers);
        }
        xss.event.trigger(xss.EV_PLAYERS_UPDATED, this.players);
    },

    ncNotifySnakesCrashed: function(serializedCollisions) {
        var notification = '', names = this.players.getNames();
        for (var i = 0, m = serializedCollisions.length; i < m; i++) {
            notification += names[serializedCollisions[i][0]];

            if (i + 1 === m) {
                notification += xss.COPY_SNAKE_CRASHED;
            } else if (i + 2 === m) {
                notification += xss.COPY_SPACE_AND_SPACE;
            } else {
                notification += xss.COPY_COMMA_SPACE;
            }

            if (1 === i % 2 || m === i + 1) { // Line end.
                if (i + 1 < m) { // Continuing.
                    notification += xss.COPY_ELLIPSIS;
                }
                this.messageBox.addNotification(notification);
                notification = '';
            }
        }
        this.messageBox.ui.debounceUpdate();
    }

//    /**
//     * @param {Array.<string>} names
//     * @return {Array.<string>}
//     * @private
//     */
//    _sanitizeNames: function(names) {
//        for (var i = 0, m = names.length; i < m; i++) {
//            while (xss.font.width(names[i]) > xss.UI_WIDTH_NAME) {
//                names[i] = names[i].slice(0, -1);
//            }
//        }
//        return names;
//    }

};

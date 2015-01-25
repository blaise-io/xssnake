'use strict';

/**
 * @constructor
 */
xss.room.ClientRoom = function() {
    /** @type {string} */
    this.key = null;

    this.game = null;

    this.players = new xss.room.ClientPlayerRegistry();
    this.options = new xss.room.ClientOptions();

    /** @typedef {xss.room.ClientRound} */
    this.round = null;
    this.messagebox = null;
    this.scoreboard = null;

    this.bindEvents();
};

xss.room.ClientRoom.prototype = {

    destruct: function() {
        xss.util.hash();
        this.unbindEvents();
        this.players.destruct();
        this.options.destruct();
        this.round.destruct();
        this.messagebox.destruct();
        this.scoreboard.destruct();
    },

    bindEvents: function() {
        xss.event.on(xss.NC_ROOM_SERIALIZE, xss.NS_ROOM, this.setRoom.bind(this));
        xss.event.on(xss.NC_OPTIONS_SERIALIZE, xss.NS_ROOM, this.updateOptions.bind(this));
        xss.event.on(xss.NC_ROOM_PLAYERS_SERIALIZE, xss.NS_ROOM, this.updatePlayers.bind(this));

        // TODO: Create a notifier class?
        xss.event.on(xss.NC_SNAKE_CRASH, xss.NS_ROOM, this.notifySnakesCrashed.bind(this));

        //xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_ROOM, this._handleKeys.bind(this));
        //xss.event.on(xss.NC_ROUND_COUNTDOWN, xss.NS_ROOM, this._unbindKeys.bind(this));
        //xss.event.on(xss.NC_ROOM_SERIALIZE, xss.NS_ROOM, this._initRoom.bind(this));
        //xss.event.on(xss.NC_XSS, xss.NS_ROOM, this._requestXss.bind(this));
        //xss.event.on(xss.NC_XSS, xss.NS_ROOM, this._evalXss.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_ROOM_SERIALIZE, xss.NS_ROOM);
        xss.event.off(xss.NC_OPTIONS_SERIALIZE, xss.NS_ROOM);
        xss.event.off(xss.NC_ROOM_PLAYERS_SERIALIZE, xss.NS_ROOM);
    },

    propagateToPlayer: function() {
        this.round = new xss.room.ClientRound(this.players, this.options);
        this.scoreboard = new xss.room.Scoreboard(this.players);
        this.messagebox = new xss.room.MessageBox(this.players);
    },

    setRoom: function(serializedRoom) {
        this.key = serializedRoom[0];
        xss.util.hash(xss.HASH_ROOM, this.key);
    },

    updateOptions: function(serializedOptions) {
        this.options.deserialize(serializedOptions);
    },

    updatePlayers: function(serializedPlayers) {
        this.players.deserialize(serializedPlayers);
        xss.event.trigger(xss.EV_PLAYERS_UPDATED, this.players);
    },

    gameHasStarted: function() {
        return (
            this.round &&
            this.round.game &&
            this.round.game.started
        );
    },

    notifySnakesCrashed: function(serializedCollisions) {
        var names, notification = '';
        names = this.players.getNames();
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
                this.messagebox.addNotification(notification);
                notification = '';
            }
        }
        this.messagebox.ui.debounceUpdate();
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

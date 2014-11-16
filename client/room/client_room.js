'use strict';

/**
 * @constructor
 */
xss.room.ClientRoom = function() {
    /** @type {string} */
    this.key = null;

    this.game = null;
    this.chat = null;

    this.players = new xss.room.ClientPlayerRegistry();
    this.options = new xss.room.ClientOptions();

    /** @typedef {xss.room.ClientRound} */
    this.round = null;
    this.messagebox = null;

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
    },

    bindEvents: function() {
        xss.event.on(xss.NC_ROOM_SERIALIZE, xss.NS_ROOM, this.setRoom.bind(this));
        xss.event.on(xss.NC_ROOM_OPTIONS_SERIALIZE, xss.NS_ROOM, this.updateOptions.bind(this));
        xss.event.on(xss.NC_ROOM_PLAYERS_SERIALIZE, xss.NS_ROOM, this.updatePlayers.bind(this));

        //xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_ROOM, this._handleKeys.bind(this));
        //xss.event.on(xss.NC_ROUND_COUNTDOWN, xss.NS_ROOM, this._unbindKeys.bind(this));
        //xss.event.on(xss.NC_ROOM_SERIALIZE, xss.NS_ROOM, this._initRoom.bind(this));
        //xss.event.on(xss.NC_XSS, xss.NS_ROOM, this._requestXss.bind(this));
        //xss.event.on(xss.NC_XSS, xss.NS_ROOM, this._evalXss.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_ROOM_SERIALIZE, xss.NS_ROOM);
        xss.event.off(xss.NC_ROOM_OPTIONS_SERIALIZE, xss.NS_ROOM);
        xss.event.off(xss.NC_ROOM_PLAYERS_SERIALIZE, xss.NS_ROOM);
    },

    propagateToPlayer: function() {
        this.round = new xss.room.ClientRound(this.players, this.options);
        this.messagebox = new xss.room.MessageBox();
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

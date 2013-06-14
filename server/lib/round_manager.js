/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Score = require('./score.js');
var Round = require('./round.js');
var CONST = require('../shared/const.js');

/**
 * @param {Room} room
 * @constructor
 */
function RoundManager(room) {
    this.room = room;
    this.level = 0;
    this.round = new Round(room, this.level);
    this.score = new Score(room);
    this.started = false;

    this.roundsPlayed = 0;
    this.maxRounds = CONST.ROUNDS_MAX;
}

module.exports = RoundManager;

RoundManager.prototype = {

    _nextRoundTimer: null,

    destruct: function() {
        clearTimeout(this._nextRoundTimer);
        this.round.destruct();
        this.score.destruct();
        this.room = null;
        this.round = null;
        this.score = null;
    },

    addClient: function(client) {
        this.score.addClient(client);
    },

    removeClient: function(client) {
        this.round.removeClient(client);
        this.score.removeClient(client);
    },

    detectStart: function() {
        if (this.room.isFull()) {
            this.round.countdown();
            this.started = true;
        }
    },

    delegateCrash: function() {
        this.score.dealKnockoutPoints(this.room);
        if (this.round.isEnded()) {
            this.endCurrentRound();
        }
    },

    /**
     * @return {boolean}
     */
    allRoundsPlayed: function() {
        return (this.roundsPlayed >= this.maxRounds);
    },

    endCurrentRound: function() {
        var winner = this.score.getWinner();
        if (this.allRoundsPlayed() && winner) {
            this.allRoundsEnded(winner);
        } else {
            this.nextRoundStartDelay();
        }
    },

    /**
     * @param {Client} winner
     */
    allRoundsEnded: function(winner) {
        if (this.room.options[CONST.FIELD_XSS]) {
            this.room.requestXSS(winner);
        } else {
            console.log('this.game.showHeaven(winner)');
        }
    },

    nextRoundStartDelay: function() {
        var delay = this.round.allCrashed() ?
            CONST.TIME_ROUND_DELAY : CONST.TIME_GLOAT;

        this.room.emit(
            CONST.EVENT_CHAT_NOTICE, [CONST.NOTICE_NEW_ROUND, delay]
        );

        this._nextRoundTimer = setTimeout(
            this.nextRoundStart.bind(this), delay * 1000
        );
    },

    nextRoundStart: function() {
        this.roundsPlayed++;
        this.round.destruct();
        this.round = new Round(this.room, this.getNextLevel());
        this.round.countdown();
        this.room.emitState();
    },

    getNextLevel: function() {
        return ++this.level;
    }

};

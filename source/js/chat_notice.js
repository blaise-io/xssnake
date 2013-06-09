/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Chat*/
'use strict';

Chat.prototype._notice = {

    /**
     * @param {Array} notice
     * @returns {string}
     */
    format: function(notice) {
        var format = XSS.util.format;
        this.names = XSS.room.chat.names;
        switch (notice[0]) {
            case CONST.NOTICE_CRASH:
                return this.crash(notice[1], notice[2], notice[3]);
            case CONST.NOTICE_JOIN:
                return format(CONST.MSG_JOINED_GAME, this.names[notice[1]]);
            case CONST.NOTICE_LEAVE:
                return format(CONST.MSG_LEFT_GAME, this.names[notice[1]]);
            case CONST.NOTICE_NEW_ROUND:
                return format(CONST.MSG_NEW_ROUND, notice[1]);
            default:
                return '';
        }
    },

    /**
     * @param {number} index
     * @param {number} client
     * @param {number} opponent
     * @returns {string}
     */
    crash: function(index, client, opponent) {
        var notice, names = this.names;
        switch (index) {
            case CONST.CRASH_WALL:
                notice = CONST.MSG_CRASH_WALL;
                break;
            case CONST.CRASH_SELF:
                notice = CONST.MSG_CRASH_SELF;
                break;
            case CONST.CRASH_OPPONENT:
                notice = CONST.MSG_CRASH_OPPONENT;
                break;
            case CONST.CRASH_OPPONENT_DRAW:
                notice = CONST.MSG_CRASH_OPPONENT_DRAW;
                break;
        }
        return XSS.util.format(notice, names[client], names[opponent]);
    }

};

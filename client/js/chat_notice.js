'use strict';

xss.Chat.prototype._notice = {

    /**
     * @param {Array} notice
     * @return {string}
     */
    format: function(notice) {
        var format = xss.util.format;
        this.names = xss.room.chat.names;
        switch (notice[0]) {
            case xss.NOTICE_CRASH:
                return this.crash(notice[1], notice[2], notice[3]);
            case xss.NOTICE_JOIN:
                return format(xss.MSG_JOINED_GAME, this.names[notice[1]]);
            case xss.NOTICE_DISCONNECT:
                return format(xss.MSG_LEFT_GAME, this.names[notice[1]]);
            case xss.NOTICE_NEW_ROUND:
                return format(xss.MSG_NEW_ROUND, notice[1]);
            default:
                return '';
        }
    },

    /**
     * @param {number} index
     * @param {number} client
     * @param {number} opponent
     * @return {string}
     */
    crash: function(index, client, opponent) {
        var notice, names = this.names;
        switch (index) {
            case xss.CRASH_WALL:
                notice = xss.MSG_CRASH_WALL;
                break;
            case xss.CRASH_MOVING_WALL:
                notice = xss.MSG_CRASH_MOVING_WALL;
                break;
            case xss.CRASH_SELF:
                notice = xss.MSG_CRASH_SELF;
                break;
            case xss.CRASH_OPPONENT:
                notice = xss.MSG_CRASH_OPPONENT;
                break;
            case xss.CRASH_OPPONENT_DRAW:
                notice = xss.MSG_CRASH_OPPONENT_DRAW;
                break;
        }
        return xss.util.format(notice, names[client], names[opponent]);
    }

};

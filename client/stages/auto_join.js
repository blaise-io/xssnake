'use strict';

/**
 * @extends {xss.InputStage}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.AutoJoinStage = function() {
    /** @type {xss.room.ClientRoom} */
    this.room = xss.player.room;

    this.header = 'JOiN GAME';
    this.label = this.getRoomSummary();
    this.name = xss.STORAGE_NAME;

    xss.flow.GameStage = xss.stage.QuickJoinGame;
    this.next = this.room.options.isXSS ? xss.ChallengeStage : xss.flow.GameStage;

    this.minlength = xss.PLAYER_NAME_MINLENGTH;
    this.maxwidth = xss.PLAYER_NAME_MAXWIDTH;

    xss.InputStage.call(this);
};

xss.extend(xss.AutoJoinStage.prototype, xss.InputStage.prototype);
xss.extend(xss.AutoJoinStage.prototype, /** @lends {xss.AutoJoinStage.prototype} */ {

    getRoomSummary: function() {
        var summary = [];

        summary.push(
            xss.util.format(
                xss.COPY_AUTOJOIN_PLAYERS, this.room.players.getTotal()
            ) + '\t' +
            this.room.players.getNames().join(xss.COPY_COMMA_SPACE)
        );

        summary.push(
            xss.COPY_FIELD_MAX_PLAYERS + '\t' +
            this.room.options.maxPlayers
        );

        summary.push(
            xss.COPY_FIELD_LEVEL_SET + '\t' +
            xss.levelsetRegistry.getLevelset(this.room.options.levelset).title
        );

        summary.push(
            xss.COPY_FIELD_POWERUPS + '\t' +
            xss.COPY_BOOL[Number(this.room.options.hasPowerups)]
        );

        summary.push(
            xss.COPY_FIELD_XSS + '\t' +
            xss.COPY_BOOL[Number(this.room.options.isXSS)]
        );

        return summary.join('\n') + '\n\n' + xss.COPY_AUTOJOIN_ENTER_NAME;
    }

});

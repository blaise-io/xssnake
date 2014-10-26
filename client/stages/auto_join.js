'use strict';

/**
 * @extends {xss.InputStage}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.AutoJoinStage = function() {
    var isXSS, autoJoinData = xss.flow.getData().autoJoin;

    this._options = autoJoinData[1];
    this._players = autoJoinData[2];

    this.header = 'JOiN GAME';
    this.label = this._getLabel();
    this.name = xss.STORAGE_NAME;

    isXSS = this._options[xss.FIELD_XSS];
    this.next = (isXSS) ? xss.ChallengeStage : xss.StartGameStage;

    this.minlength = xss.PLAYER_NAME_MINLENGTH;
    this.maxwidth = xss.PLAYER_NAME_MAXWIDTH;

    xss.InputStage.call(this);
};

xss.util.extend(xss.AutoJoinStage.prototype, xss.InputStage.prototype);
xss.util.extend(xss.AutoJoinStage.prototype, /** @lends xss.AutoJoinStage.prototype */ {

    getData: function() {
        return {
            name: this.getValue()
        };
    },

    _getLabel: function() {
        var bools, label, options, players;

        options = this._options;
        players = this._players;

        bools = {'false': 'No', 'true' : 'Yes'};

        label = [
            'Players ' + players.length + '/' + options[xss.FIELD_MAX_PLAYERS] + ': ' + players.join(', '),
            'Level set: ' + xss.levelsetRegistry.levelsets[options[xss.FIELD_LEVEL_SET]].title,
            'Power-Ups: ' + bools[options[xss.FIELD_POWERUPS]],
            'XSS ' + xss.UC_SKULL + ': ' + bools[options[xss.FIELD_XSS]],
            '',
            'Enter your name to join: '
        ].join('\n');

        return label;
    }

});

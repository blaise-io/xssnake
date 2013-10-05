'use strict';

/**
 * @extends {xss.InputStage}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.AutoJoinStage = function() {
    var isxss, autoJoinData = xss.flow.getData().autoJoin;

    this._options = autoJoinData[1];
    this._players = autoJoinData[2];

    this.header = 'JOiN GAME';
    this.label = this._getLabel();
    this.name = xss.STORAGE_NAME;

    isxss = this._options[xss.FIELD_xss];
    this.next = (isxss) ? xss.ChallengeStage : xss.StartGameStage;

    this.minChars = 2;
    this.maxValWidth = xss.UI_WIDTH_NAME;

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
        var diffs, bools, label, options, players, br = '\n';

        options = this._options;
        players = this._players;

        diffs = {
            '1': 'Worm',
            '2': 'Snake',
            '3': 'Python'
        };

        // TODO: Use integers to save bandwidth
        bools = {'false': 'No', 'true' : 'Yes'};

        label = '' +
            'Players ' +
            players.length + '/' + options[xss.FIELD_MAX_PLAYERS] + ': ' +
            players.join(', ') + br +
            'Difficulty: ' + diffs[options[xss.FIELD_DIFFICULTY]] + br +
            'Power-Ups: ' + bools[options[xss.FIELD_POWERUPS]] + br +
            'xss ' + xss.UC_SKULL + ': ' + bools[options[xss.FIELD_xss]] +
            br + br +
            'Enter your name to join: ';

        return label;
    }

});

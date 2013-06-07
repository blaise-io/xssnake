/*jshint globalstrict:true, es5:true, sub:true, evil:true*/
/*globals XSS, CONST, InputStage, ChallengeStage, StartGameStage */
'use strict';

/**
 * @extends {InputStage}
 * @implements {StageInterface}
 * @constructor
 */
function AutoJoinStage() {
    var isXSS, autoJoinData = XSS.flow.getData().autoJoin;

    this.header = 'JOiN GAME';
    this.label = this._getLabel();
    this.name = CONST.STORAGE_NAME;

    this._options = autoJoinData[1];
    this._players = autoJoinData[2];

    isXSS = this._options[CONST.FIELD_XSS];
    this.next = (isXSS) ? ChallengeStage : StartGameStage;

    this.minChars = 2;
    this.maxValWidth = CONST.UI_WIDTH_NAME;

    InputStage.call(this);
}

XSS.util.extend(AutoJoinStage.prototype, InputStage.prototype);
XSS.util.extend(AutoJoinStage.prototype, /** @lends AutoJoinStage.prototype */ {

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
            players.length + '/' + options[CONST.FIELD_MAX_PLAYERS] + ': ' +
            players.join(', ') + br +
            'Difficulty: ' + diffs[options[CONST.FIELD_DIFFICULTY]] + br +
            'Power-Ups: ' + bools[options[CONST.FIELD_POWERUPS]] + br +
            'XSS ' + CONST.UC_SKULL + ': ' + bools[options[CONST.FIELD_XSS]] +
            br + br +
            'Enter your name to join: ';

        return label;
    }

});

'use strict';

/**
 * @constructor
 * @implements {xss.StageInterface}
 * @extends {xss.FormStage}
 */
xss.MultiplayerStage = function() {
    xss.FormStage.call(this);
    this.form = this._getForm();
};

xss.util.extend(xss.MultiplayerStage.prototype, xss.FormStage.prototype);
xss.util.extend(xss.MultiplayerStage.prototype, /** @lends xss.MultiplayerStage.prototype */ {

    /**
     * @return {Object}
     */
    getData: function() {
        return {
            multiplayer: this.form.getData()
        };
    },

    /**
     * @param values
     * @returns {Function}
     * @private
     */
    getNextStage: function(values) {
        if (values[xss.FIELD_xss]) {
            return xss.ChallengeStage;
        } else {
            return xss.StartGameStage;
        }
    },

    /**
     * @returns {xss.Form}
     * @private
     */
    _getForm: function() {
        var form = new xss.Form('GAME OPTIONS');

        form.addField(xss.FIELD_DIFFICULTY, 'LEVEL DIFFICULTY', [
            [xss.FIELD_VALUE_MEDIUM, 'SNAKE'],
            [xss.FIELD_VALUE_HARD, 'PYTHON'],
            [xss.FIELD_VALUE_EASY, 'WORM']
        ]);

        form.addField(xss.FIELD_POWERUPS, 'POWER-UPS', [
            [true, 'YES'],
            [false, 'NO']
        ]);

        // Trololol
        form.addField('', 'WEIRD BUGS', [
            ['YES'],['OK'],['TRUE'],['ACCEPT'],['ENABLE'],['HAO'],['OUI!']
        ]);

        form.addField(xss.FIELD_PRIVATE, 'PRIVATE', [
            [false, 'NO'],
            [true, 'YES']
        ]);

        form.addField(xss.FIELD_xss, 'xss ' + xss.UC_SKULL, [
            [false, 'NO'],
            [true, 'YES']
        ]);

        form.addField(xss.FIELD_MAX_PLAYERS, 'MAX PLAYERS', [
            [6],[1],[2],[3],[4],[5]
        ]);

        return form;
    }
});


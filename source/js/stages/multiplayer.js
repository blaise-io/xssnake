/*jshint globalstrict:true, sub:true, evil:true*/
/*globals XSS, CONST, FormStage, Form, ChallengeStage, StartGameStage*/
'use strict';

/**
 * @constructor
 * @implements {StageInterface}
 * @extends {FormStage}
 */
function MultiplayerStage() {
    FormStage.call(this);
    this.form = this._getForm();
}

XSS.util.extend(MultiplayerStage.prototype, FormStage.prototype);
XSS.util.extend(MultiplayerStage.prototype, /** @lends MultiplayerStage.prototype */ {

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
        if (values[CONST.FIELD_XSS]) {
            return ChallengeStage;
        } else {
            return StartGameStage;
        }
    },

    /**
     * @returns {Form}
     * @private
     */
    _getForm: function() {
        var form = new Form('GAME OPTIONS');

        form.addField(CONST.FIELD_DIFFICULTY, 'LEVEL DIFFICULTY', [
            [CONST.FIELD_VALUE_MEDIUM, 'SNAKE'],
            [CONST.FIELD_VALUE_HARD, 'PYTHON'],
            [CONST.FIELD_VALUE_EASY, 'WORM']
        ]);

        form.addField(CONST.FIELD_POWERUPS, 'POWER-UPS', [
            [true, 'YES'],
            [false, 'NO']
        ]);

        // Trololol
        form.addField('', 'WEIRD BUGS', [
            ['YES'],['OK'],['TRUE'],['ACCEPT'],['ENABLE'],['HAO'],['OUI!']
        ]);

        form.addField(CONST.FIELD_PRIVATE, 'PRIVATE', [
            [false, 'NO'],
            [true, 'YES']
        ]);

        form.addField(CONST.FIELD_XSS, 'XSS ' + CONST.UC_SKULL, [
            [false, 'NO'],
            [true, 'YES']
        ]);

        form.addField(CONST.FIELD_MAX_PLAYERS, 'MAX PLAYERS', [
            [6],[1],[2],[3],[4],[5]
        ]);

        return form;
    }

});

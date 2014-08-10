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
     * @return {Function}
     * @private
     */
    getNextStage: function(values) {
        if (values[xss.FIELD_XSS]) {
            return xss.ChallengeStage;
        } else {
            return xss.StartGameStage;
        }
    },

    /**
     * @return {xss.Form}
     * @private
     */
    _getForm: function() {
        var footer, form;

        footer = 'Use arrow keys to select and change options.\n' +
                 'When you’re done, press ' + xss.UC_ENTER_KEY + ' to continue.';

        form = new xss.Form('GAME OPTIONS', footer);

        form.addField(xss.FIELD_LEVEL_SET, xss.COPY_FIELD_LEVEL_SET.toUpperCase(),
            xss.levelSetRegistry.getAsFieldValues()
        );

        form.addField(xss.FIELD_POWERUPS, 'POWER-UPS', [
            [true, 'YES'],
            [false, 'NO']
        ]);

        // Trololol
        form.addField('', 'WEIRD BUGS', [
            ['YES'],
            ['ENABLE'],
            ['OK'],
            ['TRUE'],
            ['ACCEPT'],
            ['HAO'],
            ['OUI!'],
            ['SI SENOR']
        ]);

        form.addField(xss.FIELD_PRIVATE, 'PRIVATE GAME', [
            [false, 'NO'],
            [true, 'YES']
        ]);

        form.addField(xss.FIELD_XSS, 'XSS ' + xss.UC_SKULL, [
            [false, 'NO'],
            [true, 'YES']
        ]);

        form.addField(xss.FIELD_MAX_PLAYERS, 'MAX PLAYERS', [
            [6],[1],[2],[3],[4],[5]
        ]);

        return form;
    }
});


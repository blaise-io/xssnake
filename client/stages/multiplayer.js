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

xss.extend(xss.MultiplayerStage.prototype, xss.FormStage.prototype);
xss.extend(xss.MultiplayerStage.prototype, /** @lends {xss.MultiplayerStage.prototype} */ {

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

        footer = xss.COPY_FORM_INSTRUCT;

        form = new xss.Form(xss.COPY_OPTIONS_STAGE_HEADER, footer);

        form.addField(xss.FIELD_LEVEL_SET, xss.COPY_FIELD_LEVEL_SET,
            xss.levelsetRegistry.getAsFieldValues()
        );

        form.addField(xss.FIELD_POWERUPS, xss.COPY_FIELD_POWERUPS, [
            [true, xss.COPY_FIELD_TRUE],
            [false, xss.COPY_FIELD_FALSE]
        ]);

        // Trololol
        form.addField(xss.FIELD_BUGS, xss.COPY_FIELD_BUGS, [
            [true, xss.COPY_FIELD_TRUE_OPT1],
            [true, xss.COPY_FIELD_TRUE_OPT2],
            [true, xss.COPY_FIELD_TRUE_OPT3],
            [true, xss.COPY_FIELD_TRUE_OPT4],
            [true, xss.COPY_FIELD_TRUE_OPT5],
            [true, xss.COPY_FIELD_TRUE_OPT6],
            [true, xss.COPY_FIELD_TRUE_OPT7],
            [true, xss.COPY_FIELD_TRUE_OPT8],
            [true, xss.COPY_FIELD_TRUE_OPT9]
        ]);

        form.addField(xss.FIELD_PRIVATE, xss.COPY_FIELD_PRIVATE, [
            [false, xss.COPY_FIELD_FALSE],
            [true, xss.COPY_FIELD_TRUE]
        ]);

        form.addField(xss.FIELD_XSS, xss.COPY_FIELD_XSS, [
            [false, xss.COPY_FIELD_FALSE],
            [true, xss.COPY_FIELD_TRUE]
        ]);

        form.addField(xss.FIELD_MAX_PLAYERS, xss.COPY_FIELD_MAX_PLAYERS, [
            [6, '6'],
            [1, '1'],
            [2, '2'],
            [3, '3'],
            [4, '4'],
            [5, '5']
        ]);

        return form;
    }
});


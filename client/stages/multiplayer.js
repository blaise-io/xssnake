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

        footer = xss.COPY_FORM_INSTRUCT;

        form = new xss.Form(xss.COPY_OPTIONS_STAGE_HEADER, footer);

        form.addField(xss.FIELD_LEVEL_SET, xss.COPY_FIELD_LEVEL_SET,
            xss.levelSetRegistry.getAsFieldValues()
        );

        form.addField(xss.FIELD_POWERUPS, xss.COPY_FIELD_POWERUPS, [
            [true, xss.COPY_FIELD_TRUE],
            [false, xss.COPY_FIELD_FALSE]
        ]);

        // Trololol
        form.addField(xss.FIELD_BUGS, xss.COPY_FIELD_BUGS, [
            [xss.COPY_FIELD_TRUE_OPT1],
            [xss.COPY_FIELD_TRUE_OPT2],
            [xss.COPY_FIELD_TRUE_OPT3],
            [xss.COPY_FIELD_TRUE_OPT4],
            [xss.COPY_FIELD_TRUE_OPT5],
            [xss.COPY_FIELD_TRUE_OPT6],
            [xss.COPY_FIELD_TRUE_OPT7],
            [xss.COPY_FIELD_TRUE_OPT8],
            [xss.COPY_FIELD_TRUE_OPT9]
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
            [6],[1],[2],[3],[4],[5]
        ]);

        return form;
    }
});


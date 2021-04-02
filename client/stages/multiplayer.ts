import { State } from "../state/state";

/**
 * @constructor
 * @implements {StageInterface}
 * @extends {FormStage}
 */
MultiplayerStage = function() {
    FormStage.call(this);
    this.form = this._getForm();
};

extend(MultiplayerStage.prototype, FormStage.prototype);
extend(MultiplayerStage.prototype, /** @lends {MultiplayerStage.prototype} */ {

    /**
     * @return {Object}
     */
    getData() {
        return {
            multiplayer: this.form.getData()
        };
    }

    /**
     * @param values
     * @return {Function}
     * @private
     */
    getNextStage(values) {
        if (values[FIELD_XSS]) {
            return ChallengeStage;
        } else {
            return StartGameStage;
        }
    }

    /**
     * @return {Form}
     * @private
     */
    _getForm() {
        var footer, form;

        footer = COPY_FORM_INSTRUCT;

        form = new Form(COPY_OPTIONS_STAGE_HEADER, footer);

        form.addField(FIELD_LEVEL_SET, COPY_FIELD_LEVEL_SET,
            State.levelsetRegistry.getAsFieldValues()
        );

        form.addField(FIELD_POWERUPS, COPY_FIELD_POWERUPS, [
            [true, COPY_FIELD_TRUE],
            [false, COPY_FIELD_FALSE]
        ]);

        // Trololol
        form.addField(FIELD_BUGS, COPY_FIELD_BUGS, [
            [true, COPY_FIELD_TRUE_OPT1],
            [true, COPY_FIELD_TRUE_OPT2],
            [true, COPY_FIELD_TRUE_OPT3],
            [true, COPY_FIELD_TRUE_OPT4],
            [true, COPY_FIELD_TRUE_OPT5],
            [true, COPY_FIELD_TRUE_OPT6],
            [true, COPY_FIELD_TRUE_OPT7],
            [true, COPY_FIELD_TRUE_OPT8],
            [true, COPY_FIELD_TRUE_OPT9]
        ]);

        form.addField(FIELD_PRIVATE, COPY_FIELD_PRIVATE, [
            [false, COPY_FIELD_FALSE],
            [true, COPY_FIELD_TRUE]
        ]);

        form.addField(FIELD_XSS, COPY_FIELD_XSS, [
            [false, COPY_FIELD_FALSE],
            [true, COPY_FIELD_TRUE]
        ]);

        form.addField(FIELD_MAX_PLAYERS, COPY_FIELD_MAX_PLAYERS, [
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


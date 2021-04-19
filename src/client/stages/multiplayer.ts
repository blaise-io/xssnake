import { levelsets } from "../../shared/data/levelsets";
import {
    FIELD_BUGS,
    FIELD_LEVEL_SET,
    FIELD_MAX_PLAYERS,
    FIELD_POWERUPS,
    FIELD_PRIVATE,
    FIELD_XSS,
} from "../const";
import {
    COPY_FIELD_BUGS,
    COPY_FIELD_FALSE,
    COPY_FIELD_LEVEL_SET,
    COPY_FIELD_MAX_PLAYERS,
    COPY_FIELD_POWERUPS,
    COPY_FIELD_PRIVATE,
    COPY_FIELD_TRUE,
    COPY_FIELD_TRUE_OPT1,
    COPY_FIELD_TRUE_OPT2,
    COPY_FIELD_TRUE_OPT3,
    COPY_FIELD_TRUE_OPT4,
    COPY_FIELD_TRUE_OPT5,
    COPY_FIELD_TRUE_OPT6,
    COPY_FIELD_TRUE_OPT7,
    COPY_FIELD_TRUE_OPT8,
    COPY_FIELD_TRUE_OPT9,
    COPY_FIELD_XSS,
    COPY_FORM_INSTRUCT,
    COPY_OPTIONS_STAGE_HEADER,
} from "../copy/copy";
import { FormStage } from "../stage_base/formStage";
import { Form } from "../stage_class_helper/form";
import { ChallengeStage } from "./challenge";
import { StartGameStage } from "./startGame";

export class MultiplayerStage extends FormStage {
    constructor() {
        super();
        this.form = this._getForm();
    }

    getData(): { multiplayer: any } {
        return {
            multiplayer: this.form.getData(),
        };
    }

    getNextStage(values: Record<string, any>): typeof ChallengeStage | typeof StartGameStage {
        if (values[FIELD_XSS]) {
            return ChallengeStage;
        } else {
            return StartGameStage;
        }
    }

    private _getForm() {
        const form = new Form(COPY_OPTIONS_STAGE_HEADER, COPY_FORM_INSTRUCT);

        form.addField(
            FIELD_LEVEL_SET,
            COPY_FIELD_LEVEL_SET,
            levelsets.map((l) => l.title.toUpperCase())
        );

        form.addField(FIELD_POWERUPS, COPY_FIELD_POWERUPS, [
            [true, COPY_FIELD_TRUE],
            [false, COPY_FIELD_FALSE],
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
            [true, COPY_FIELD_TRUE_OPT9],
        ]);

        form.addField(FIELD_PRIVATE, COPY_FIELD_PRIVATE, [
            [false, COPY_FIELD_FALSE],
            [true, COPY_FIELD_TRUE],
        ]);

        form.addField(FIELD_XSS, COPY_FIELD_XSS, [
            [false, COPY_FIELD_FALSE],
            [true, COPY_FIELD_TRUE],
        ]);

        form.addField(FIELD_MAX_PLAYERS, COPY_FIELD_MAX_PLAYERS, [
            [6, "6"],
            [1, "1"],
            [2, "2"],
            [3, "3"],
            [4, "4"],
            [5, "5"],
        ]);

        return form;
    }
}
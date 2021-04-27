import { levelsets } from "../../shared/data/levelsets";
import { _, noop } from "../../shared/util";
import { UC } from "../const";
import { State } from "../state";
import { FormStage } from "./base/formStage";
import { GameStage } from "./base/gameStage";
import { StageConstructor } from "./base/stage";
import { Field, Form } from "./components/form";
import { ChallengeStage } from "./challenge";

export class MultiplayerStage extends FormStage {
    constructor() {
        super();
        this.form = this._getForm();
    }

    get nextStage(): StageConstructor {
        if (State.flow.data.roomOptions.isXSS) {
            return ChallengeStage;
        } else {
            return GameStage;
        }
    }

    private _getForm() {
        const form = new Form(_("Game Options"));

        form.addField(
            new Field(
                _("Level Set"),
                levelsets.map((l, index) => [index, l.title.toUpperCase()]),
                State.flow.data.roomOptions.levelsetIndex,
                (value) => {
                    State.flow.data.roomOptions.levelsetIndex = value;
                },
            ),
        );

        form.addField(
            new Field(
                _("Enable Power-Ups"),
                [
                    [true, _("Yes")],
                    [false, _("No")],
                ],
                State.flow.data.roomOptions.hasPowerups,
                (value) => {
                    State.flow.data.roomOptions.hasPowerups = value;
                },
            ),
        );

        form.addField(
            new Field(
                _("Enable Bugs") + " " + UC.BUG,
                [
                    [0, _("Yes")],
                    [1, _("Enable")],
                    [2, _("OK")],
                    [3, _("True")],
                    [4, _("Accept")],
                    [5, _("Hao")],
                    [6, _("Oui!")],
                    [7, _("Si Senor")],
                    [8, UC.YES],
                ],
                0,
                noop,
            ),
        );

        form.addField(
            new Field(
                _("Private Room"),
                [
                    [true, _("Yes")],
                    [false, _("No")],
                ],
                State.flow.data.roomOptions.isPrivate,
                (value) => {
                    State.flow.data.roomOptions.isPrivate = value;
                },
            ),
        );

        form.addField(
            new Field(
                _("Winner fires XSS"),
                [
                    [true, _("Yes")],
                    [false, _("No")],
                ],
                State.flow.data.roomOptions.isXSS,
                (value) => {
                    State.flow.data.roomOptions.isXSS = value;
                },
            ),
        );

        form.addField(
            new Field(
                _("Max # Players"),
                [
                    [1, "1"],
                    [2, "2"],
                    [3, "3"],
                    [4, "4"],
                    [5, "5"],
                    [6, "6"],
                ],
                State.flow.data.roomOptions.maxPlayers,
                (value) => {
                    State.flow.data.roomOptions.maxPlayers = value;
                },
            ),
        );

        return form;
    }
}

import { levelsets } from "../../shared/data/levelsets";
import { _, noop } from "../../shared/util";
import { UC } from "../const";
import { FlowData } from "../flow";
import { FormStage } from "./base/formStage";
import { StageConstructor } from "./base/stage";
import { Field, Form } from "./components/form";
import { ChallengeStage } from "./challenge";
import { StartGameStage } from "./startGameStage";

export class MultiplayerStage extends FormStage {
    constructor(public flowData: FlowData) {
        super();
        this.form = this._getForm();
    }

    get nextStage(): StageConstructor {
        if (this.flowData.roomOptions.isXSS) {
            return ChallengeStage;
        } else {
            return StartGameStage;
        }
    }

    private _getForm() {
        const form = new Form(_("Game Options"));

        form.addField(
            new Field(
                _("Level Set"),
                levelsets.map((l, index) => [index, l.title.toUpperCase()]),
                this.flowData.roomOptions.levelsetIndex,
                (value) => {
                    this.flowData.roomOptions.levelsetIndex = value;
                }
            )
        );

        form.addField(
            new Field(
                _("Enable Power-Ups"),
                [
                    [true, _("Yes")],
                    [false, _("No")],
                ],
                this.flowData.roomOptions.hasPowerups,
                (value) => {
                    this.flowData.roomOptions.hasPowerups = value;
                }
            )
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
                noop
            )
        );

        form.addField(
            new Field(
                _("Private Room"),
                [
                    [true, _("Yes")],
                    [false, _("No")],
                ],
                this.flowData.roomOptions.isPrivate,
                (value) => {
                    this.flowData.roomOptions.isPrivate = value;
                }
            )
        );

        form.addField(
            new Field(
                _("Winner fires XSS"),
                [
                    [true, _("Yes")],
                    [false, _("No")],
                ],
                this.flowData.roomOptions.isXSS,
                (value) => {
                    this.flowData.roomOptions.isXSS = value;
                }
            )
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
                this.flowData.roomOptions.maxPlayers,
                (value) => {
                    this.flowData.roomOptions.maxPlayers = value;
                }
            )
        );

        return form;
    }
}

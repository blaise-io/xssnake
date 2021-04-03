/**
 * @extends {InputStage}
 * @implements {StageInterface}
 * @constructor
 */
import { extend } from "../../shared/util";
import { MENU_WIDTH, STORAGE_XSS } from "../const";
import { InputStage } from "../stage_base/inputStage";
import { State } from "../state/state";
import { fontWidth } from "../ui/font";

export class InputXssStage extends InputStage {

    constructor() {
        super();
        this.name = STORAGE_XSS;
        this.header = "ENTER YOUR EVAL";
        this.label = "" +
      "Paste your JS. Keep it short; max 256 chars.\n" +
      "Line breaks will be removed.\n\n" +
      "> ";

        this.minlength = 2;
        this.maxChars = 256;
        this.displayWidth = MENU_WIDTH - fontWidth("> ");
        this.next = State.flow.GameStage;

        InputStage.call(this);

        this.value = this.value || 'document.title = "LOSER!!"';
    }

    getData() {
        return {
            xss: this.getValue()
        };
    }

}

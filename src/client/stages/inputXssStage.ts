import { _ } from "../../shared/util";
import { MENU_POS, STORAGE } from "../const";
import { GameStage } from "./base/gameStage";
import { InputStage } from "./base/inputStage";
import { State } from "../state";
import { fontWidth } from "../ui/font";

export class InputXssStage extends InputStage {
    minlength = 2;
    maxChars = 256;
    displayWidth = MENU_POS.WIDTH - fontWidth("> ");
    next = GameStage;
    initial = "document.title = 'LOSER!!'";
    name = STORAGE.XSS;
    header = _("ENTER YOUR EVAL");
    label = [
        _("Paste your JavaScript. Keep it short; max 256 chars."),
        _("Line breaks will be removed."),
        "",
        "> ",
    ].join("\n");

    constructor() {
        super();
        this.shape = this.getLabelAndValueShape();
    }

    inputSubmit(error: string, value: string, top: number): void {
        State.flow.data.xss = value;
        super.inputSubmit(error, value, top);
    }
}

import { _ } from "../../shared/util";
import { MENU_WIDTH, STORAGE_XSS } from "../const";
import { FlowData } from "../flow";
import { InputStage } from "./base/inputStage";
import { State } from "../state";
import { fontWidth } from "../ui/font";

export class InputXssStage extends InputStage {
    minlength = 2;
    maxChars = 256;
    displayWidth = MENU_WIDTH - fontWidth("> ");
    next = State.flow.GameStage;
    initial = "document.title = 'LOSER!!'";
    name = STORAGE_XSS;
    header = _("ENTER YOUR EVAL");
    label = [
        _("Paste your JavaScript. Keep it short; max 256 chars."),
        _("Line breaks will be removed."),
        "",
        "> ",
    ].join("\n");

    constructor(flowData: FlowData) {
        super(flowData);
        this.shape = this.getLabelAndValueShape();
    }

    inputSubmit(error: string, value: string, top: number): void {
        this.flowData.xss = value;
        super.inputSubmit(error, value, top);
    }
}

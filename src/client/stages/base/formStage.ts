import { Shape } from "../../../shared/shape";
import { KEY, NS } from "../../const";
import { State } from "../../state";
import { Form } from "../components/form";
import { StageConstructor, StageInterface } from "./stage";

export abstract class FormStage implements StageInterface {
    form: Form = null;

    getShape(): Shape {
        return this.form.getShape();
    }

    abstract get nextStage(): StageConstructor;

    construct(): void {
        State.events.on("keydown", NS.STAGES, this.handleKeys.bind(this));
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        State.shapes.stage = null;
    }

    private handleKeys(ev: KeyboardEvent): void {
        if (State.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
                State.flow.previousStage();
                break;
            case KEY.ENTER:
                State.flow.switchStage(this.nextStage);
                break;
            default:
                if (this.form.handleKeys(ev)) {
                    State.shapes.stage = this.getShape();
                }
        }
    }
}

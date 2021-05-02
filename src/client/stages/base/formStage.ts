import { Shape } from "../../../shared/shape";
import { KEY, NS } from "../../const";
import { State } from "../../state";
import { Form } from "../components/form";
import { StageConstructor, StageInterface } from "./stage";

export abstract class FormStage implements StageInterface {
    form: Form = undefined;

    getShape(): Shape {
        return this.form.getShape();
    }

    abstract get nextStage(): StageConstructor;

    construct(): void {
        State.events.on("keydown", NS.STAGES, this.handleKeys.bind(this));
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        State.shapes.stage = undefined;
    }

    private handleKeys(event: KeyboardEvent): void {
        if (State.keysBlocked) {
            return;
        }
        switch (event.key) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
                State.flow.previousStage();
                break;
            case KEY.ENTER:
                State.flow.switchStage(this.nextStage);
                break;
            default:
                if (this.form.handleKeys(event)) {
                    State.shapes.stage = this.getShape();
                }
        }
    }
}

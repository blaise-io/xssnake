import { Shape } from "../../../shared/shape";
import { KEY } from "../../const";
import { EventHandler } from "../../netcode/eventHandler";
import { State } from "../../state";
import { Form } from "../components/form";
import { StageConstructor, StageInterface } from "./stage";

export abstract class FormStage implements StageInterface {
    private eventHandler = new EventHandler();
    form = new Form("");

    getShape(): Shape {
        return this.form.getShape();
    }

    abstract get nextStage(): StageConstructor;

    construct(): void {
        this.eventHandler.on("keydown", this.handleKeys.bind(this));
    }

    destruct(): void {
        this.eventHandler.destruct();
        delete State.shapes.stage;
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

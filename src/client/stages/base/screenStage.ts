import { Shape } from "../../../shared/shape";
import { KEY, NS } from "../../const";
import { State } from "../../state";
import { StageInterface } from "./stage";

export class ScreenStage implements StageInterface {
    screen = null;

    getShape(): Shape {
        return this.screen;
    }

    construct(): void {
        State.events.on("keydown", NS.STAGES, this.handleKeys);
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        State.shapes.stage = null;
    }

    private handleKeys(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
            case KEY.ENTER:
                State.flow.previousStage();
        }
    }
}

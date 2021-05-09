import { Shape } from "../../../shared/shape";
import { KEY, NS } from "../../const";
import { State } from "../../state";
import { StageInterface } from "./stage";

export abstract class ScreenStage implements StageInterface {
    abstract getShape(): Shape;

    construct(): void {
        State.events.on("keydown", NS.STAGES, this.handleKeys);
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        delete State.shapes.stage;
    }

    private handleKeys(event: KeyboardEvent): void {
        switch (event.key) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
            case KEY.ENTER:
                State.flow.previousStage();
        }
    }
}

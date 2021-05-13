import { Shape } from "../../../shared/shape";
import { KEY } from "../../const";
import { EventHandler } from "../../netcode/eventHandler";
import { State } from "../../state";
import { StageInterface } from "./stage";

export abstract class ScreenStage implements StageInterface {
    abstract getShape(): Shape;
    private eventHandler = new EventHandler();

    construct(): void {
        this.eventHandler.on("keydown", this.handleKeys);
    }

    destruct(): void {
        this.eventHandler.destruct();
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

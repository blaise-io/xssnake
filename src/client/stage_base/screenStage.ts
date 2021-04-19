import { Shape } from "../../shared/shape";
import { KEY, NS } from "../const";
import { ClientState } from "../state/clientState";
import { StageInterface } from "./stage";

export class ScreenStage implements StageInterface {
    screen = null;

    getShape(): Shape {
        return this.screen;
    }

    getData(): Record<string, any> {
        return {};
    }

    construct(): void {
        ClientState.events.on("keydown", NS.STAGES, this.handleKeys);
    }

    destruct(): void {
        ClientState.events.off("keydown", NS.STAGES);
        ClientState.shapes.stage = null;
    }

    private handleKeys(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
            case KEY.ENTER:
                ClientState.flow.previousStage();
        }
    }
}

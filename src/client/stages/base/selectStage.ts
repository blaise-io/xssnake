import { Shape } from "../../../shared/shape";
import { KEY, NS } from "../../const";
import { State } from "../../state";
import { Menu } from "../components/menu";
import { StageInterface } from "./stage";

export class SelectStage implements StageInterface {
    menu = new Menu("");

    getShape(): Shape {
        return this.menu.getShape();
    }

    construct(): void {
        State.events.on("keydown", NS.STAGES, this.handleKeys.bind(this));
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        delete State.shapes.stage;
    }

    handleKeys(event: KeyboardEvent): void {
        if (State.keysBlocked) {
            return;
        }

        switch (event.key) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
                State.flow.previousStage();
                break;
            case KEY.ENTER:
                this.menu.selectedOption.onsubmit(this.menu.selected);
                break;
            default:
                if (this.menu.handleKeys(event)) {
                    State.flow.refreshShapes();
                }
        }
    }
}

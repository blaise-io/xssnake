import { Shape } from "../../../shared/shape";
import { KEY } from "../../const";
import { EventHandler } from "../../netcode/eventHandler";
import { State } from "../../state";
import { Menu } from "../components/menu";
import { StageInterface } from "./stage";

export class SelectStage implements StageInterface {
    private eventHandler = new EventHandler();
    menu = new Menu("");

    getShape(): Shape {
        return this.menu.getShape();
    }

    construct(): void {
        this.eventHandler.on("keydown", this.handleKeys.bind(this));
    }

    destruct(): void {
        this.eventHandler.destruct();
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

import { KEY, NS } from "../../const";
import { State } from "../../state";
import { StageInterface } from "./stage";

export class SelectStage implements StageInterface {
    menu = null;

    getShape() {
        return this.menu.getShape();
    }

    getData() {
        return {};
    }

    construct() {
        State.events.on("keydown", NS.STAGES, this.handleKeys.bind(this));
    }

    destruct() {
        State.events.off("keydown", NS.STAGES);
        State.shapes.stage = null;
    }

    handleKeys(ev) {
        if (State.keysBlocked) {
            return;
        }
        const next = this.menu.getNextStage();
        switch (ev.keyCode) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
                State.flow.previousStage();
                break;
            case KEY.ENTER:
                if (next) {
                    State.flow.switchStage(next);
                } else {
                    State.flow.previousStage();
                }
                break;
            case KEY.UP:
                this.menu.prev();
                State.audio.play("menu");
                State.flow.refreshShapes();
                break;
            case KEY.DOWN:
                this.menu.next();
                State.audio.play("menu");
                State.flow.refreshShapes();
        }
    }
}

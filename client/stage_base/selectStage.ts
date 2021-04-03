/**
 * SelectStage
 * Stage with a vertical select menu
 * @implements {StageInterface}
 * @constructor
 */
import { DOM_EVENT_KEYDOWN, KEY_BACKSPACE, KEY_DOWN, KEY_ENTER, KEY_ESCAPE, KEY_UP, NS_STAGES } from "../const";
import { State } from "../state/state";

export class SelectStage {

    menu = null;

    getShape() {
        return this.menu.getShape();
    }

    getData() {
        return {};
    }

    construct() {
        State.events.on(DOM_EVENT_KEYDOWN, NS_STAGES, this.handleKeys.bind(this));
    }

    destruct() {
        State.events.off(DOM_EVENT_KEYDOWN, NS_STAGES);
        State.shapes.stage = null;
    }

    handleKeys(ev) {
        if (State.keysBlocked) {
            return;
        }
        const next = this.menu.getNextStage();
        switch (ev.keyCode) {
        case KEY_BACKSPACE:
        case KEY_ESCAPE:
            State.flow.previousStage();
            break;
        case KEY_ENTER:
            if (next) {
                State.flow.switchStage(next);
            } else {
                State.flow.previousStage();
            }
            break;
        case KEY_UP:
            this.menu.prev();
            State.audio.play("menu");
            State.flow.refreshShapes();
            break;
        case KEY_DOWN:
            this.menu.next();
            State.audio.play("menu");
            State.flow.refreshShapes();
        }
    }

}

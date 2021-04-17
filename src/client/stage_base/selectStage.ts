/**
 * SelectStage
 * Stage with a vertical select menu
 * @implements {StageInterface}
 * @constructor
 */
import {
    DOM_EVENT_KEYDOWN,
    KEY_BACKSPACE,
    KEY_DOWN,
    KEY_ENTER,
    KEY_ESCAPE,
    KEY_UP,
    NS_STAGES,
} from "../const";
import { ClientState } from "../state/clientState";

export class SelectStage {
    menu = null;

    getShape() {
        return this.menu.getShape();
    }

    getData() {
        return {};
    }

    construct() {
        ClientState.events.on(DOM_EVENT_KEYDOWN, NS_STAGES, this.handleKeys.bind(this));
    }

    destruct() {
        ClientState.events.off(DOM_EVENT_KEYDOWN, NS_STAGES);
        ClientState.shapes.stage = null;
    }

    handleKeys(ev) {
        if (ClientState.keysBlocked) {
            return;
        }
        const next = this.menu.getNextStage();
        switch (ev.keyCode) {
            case KEY_BACKSPACE:
            case KEY_ESCAPE:
                ClientState.flow.previousStage();
                break;
            case KEY_ENTER:
                if (next) {
                    ClientState.flow.switchStage(next);
                } else {
                    ClientState.flow.previousStage();
                }
                break;
            case KEY_UP:
                this.menu.prev();
                ClientState.audio.play("menu");
                ClientState.flow.refreshShapes();
                break;
            case KEY_DOWN:
                this.menu.next();
                ClientState.audio.play("menu");
                ClientState.flow.refreshShapes();
        }
    }
}

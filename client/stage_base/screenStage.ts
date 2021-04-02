/**
 * BaseScreenStage
 * Stage with static content
 * @implements {StageInterface}
 * @constructor
 */
import { DOM_EVENT_KEYDOWN, KEY_BACKSPACE, KEY_ENTER, KEY_ESCAPE, NS_STAGES } from "../const";
import { State } from "../state/state";

export class ScreenStage {

    /** @type {Shape} */
    screen = null

    getShape() {
        return this.screen;
    }

    getData() {
        return {};
    }

    construct() {
        State.events.on(DOM_EVENT_KEYDOWN, NS_STAGES, this._handleKeys);
    }

    destruct() {
        State.events.off(DOM_EVENT_KEYDOWN, NS_STAGES);
        State.shapes.stage = null;
    }

    _handleKeys(ev) {
        switch (ev.keyCode) {
            case KEY_BACKSPACE:
            case KEY_ESCAPE:
            case KEY_ENTER:
                State.flow.previousStage();
        }
    }

}

import {
    DOM_EVENT_KEYDOWN,
    KEY_BACKSPACE,
    KEY_DOWN,
    KEY_ENTER,
    KEY_ESCAPE,
    KEY_LEFT,
    KEY_RIGHT,
    KEY_UP,
    NS_STAGES,
} from "../const";
import { ClientState } from "../state/clientState";

export class FormStage {
    /** @type {Form} */
    form = null;

    getShape() {
        return this.form.getShape();
    }

    getData() {
        return {};
    }

    /**
     * @param {Function} data
     * @return {Function}
     * @private
     */
    getNextStage(data) {
        return data;
    }

    construct() {
        ClientState.events.on(DOM_EVENT_KEYDOWN, NS_STAGES, this._handleKeys.bind(this));
    }

    destruct() {
        ClientState.events.off(DOM_EVENT_KEYDOWN, NS_STAGES);
        ClientState.shapes.stage = null;
    }

    _handleKeys(ev) {
        if (ClientState.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case KEY_BACKSPACE:
            case KEY_ESCAPE:
                ClientState.flow.previousStage();
                break;
            case KEY_ENTER:
                const next = this.getNextStage(this.form.getData());
                ClientState.flow.switchStage(next);
                break;
            case KEY_UP:
                this.form.selectField(-1);
                ClientState.audio.play("menu");
                ClientState.flow.refreshShapes();
                break;
            case KEY_DOWN:
                this.form.selectField(1);
                ClientState.audio.play("menu");
                ClientState.flow.refreshShapes();
                break;
            case KEY_LEFT:
                this.form.selectOption(-1);
                ClientState.audio.play("menu_alt");
                ClientState.flow.refreshShapes();
                break;
            case KEY_RIGHT:
                this.form.selectOption(1);
                ClientState.audio.play("menu_alt");
                ClientState.flow.refreshShapes();
                break;
        }
    }
}

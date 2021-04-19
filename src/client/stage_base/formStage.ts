import { Shape } from "../../shared/shape";
import { KEY, NS } from "../const";
import { ClientState } from "../state/clientState";
import { StageInterface } from "./stage";

export class FormStage implements StageInterface {
    /** @type {Form} */
    form = null;

    getShape(): Shape {
        return this.form.getShape();
    }

    getData(): Record<string, any> {
        return {};
    }

    /**
     * @param {Function} data
     * @return {Function}
     * @private
     */
    getNextStage(data: new () => StageInterface): new () => StageInterface {
        return data;
    }

    construct(): void {
        ClientState.events.on("keydown", NS.STAGES, this._handleKeys.bind(this));
    }

    destruct(): void {
        ClientState.events.off("keydown", NS.STAGES);
        ClientState.shapes.stage = null;
    }

    _handleKeys(ev: KeyboardEvent): void {
        if (ClientState.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
                ClientState.flow.previousStage();
                break;
            case KEY.ENTER:
                ClientState.flow.switchStage(this.getNextStage(this.form.getData()));
                break;
            case KEY.UP:
                this.form.selectField(-1);
                ClientState.audio.play("menu");
                ClientState.flow.refreshShapes();
                break;
            case KEY.DOWN:
                this.form.selectField(1);
                ClientState.audio.play("menu");
                ClientState.flow.refreshShapes();
                break;
            case KEY.LEFT:
                this.form.selectOption(-1);
                ClientState.audio.play("menu_alt");
                ClientState.flow.refreshShapes();
                break;
            case KEY.RIGHT:
                this.form.selectOption(1);
                ClientState.audio.play("menu_alt");
                ClientState.flow.refreshShapes();
                break;
        }
    }
}

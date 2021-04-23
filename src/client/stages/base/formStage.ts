import { Shape } from "../../../shared/shape";
import { KEY, NS } from "../../const";
import { State } from "../../state";
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
        State.events.on("keydown", NS.STAGES, this._handleKeys.bind(this));
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        State.shapes.stage = null;
    }

    _handleKeys(ev: KeyboardEvent): void {
        if (State.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
                State.flow.previousStage();
                break;
            case KEY.ENTER:
                State.flow.switchStage(this.getNextStage(this.form.getData()));
                break;
            case KEY.UP:
                this.form.selectField(-1);
                State.audio.play("menu");
                State.flow.refreshShapes();
                break;
            case KEY.DOWN:
                this.form.selectField(1);
                State.audio.play("menu");
                State.flow.refreshShapes();
                break;
            case KEY.LEFT:
                this.form.selectOption(-1);
                State.audio.play("menu_alt");
                State.flow.refreshShapes();
                break;
            case KEY.RIGHT:
                this.form.selectOption(1);
                State.audio.play("menu_alt");
                State.flow.refreshShapes();
                break;
        }
    }
}

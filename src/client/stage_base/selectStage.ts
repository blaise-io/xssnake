import { KEY, NS } from "../const";
import { ClientState } from "../state/clientState";
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
        ClientState.events.on("keydown", NS.STAGES, this.handleKeys.bind(this));
    }

    destruct() {
        ClientState.events.off("keydown", NS.STAGES);
        ClientState.shapes.stage = null;
    }

    handleKeys(ev) {
        if (ClientState.keysBlocked) {
            return;
        }
        const next = this.menu.getNextStage();
        switch (ev.keyCode) {
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
                ClientState.flow.previousStage();
                break;
            case KEY.ENTER:
                if (next) {
                    ClientState.flow.switchStage(next);
                } else {
                    ClientState.flow.previousStage();
                }
                break;
            case KEY.UP:
                this.menu.prev();
                ClientState.audio.play("menu");
                ClientState.flow.refreshShapes();
                break;
            case KEY.DOWN:
                this.menu.next();
                ClientState.audio.play("menu");
                ClientState.flow.refreshShapes();
        }
    }
}

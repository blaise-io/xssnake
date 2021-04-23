import { ROOM_KEY_LENGTH, WIDTH } from "../shared/const";
import { Shape } from "../shared/shape";
import { HASH_ROOM, KEY, MENU_LEFT, NS, STORAGE_MUTE } from "./const";
import { StageInterface } from "./stages/base/stage";
import { MainStage } from "./stages/main";
import { State } from "./state";
import { outerBorder, xssnakeHeader } from "./ui/clientShapeGenerator";
import { fontLoad } from "./ui/font";
import { animate } from "./ui/shapeClient";
import { instruct, storage, urlHash } from "./util/clientUtil";

export class StageFlow {
    GameStage: new () => StageInterface;
    stage: StageInterface;
    private history: StageInterface[] = [];

    constructor(private FirstStage = MainStage as new () => StageInterface) {
        (async () => {
            await fontLoad();
            this.start();
        })();
    }

    destruct(): void {
        this.stage.destruct();
        this.history.length = 0;
        State.shapes = {};
        State.events.off("keydown", NS.FLOW);
        State.canvas.garbageCollect();
    }

    restart(): void {
        this.destruct();
        this.start();
    }

    start(): void {
        window.onhashchange = this.hashChange.bind(this);
        State.events.on("keydown", NS.FLOW, this.handleKeys.bind(this));

        Object.assign(State.shapes, outerBorder());
        State.shapes.HEADER = xssnakeHeader();

        this.setStage(new this.FirstStage(), false);
    }

    getData(): Record<string, any> {
        const value = {};
        for (let i = 0, m = this.history.length; i < m; i++) {
            Object.assign(value, this.history[i].getData());
        }
        return value;
    }

    switchStage(Stage: new () => StageInterface, options = { back: false }): void {
        let switchToStage;

        if (Stage && !options.back) {
            switchToStage = new Stage();
        } else {
            switchToStage = this.history[this.history.length - 2];
        }

        // Unload old stage
        this.stage.destruct();

        // Remove everything
        State.shapes.stage = null;

        // Replace by levelanim
        this.switchStageAnimate(
            this.stage.getShape(),
            switchToStage.getShape(),
            options.back,
            () => {
                this.setStage(switchToStage, options.back);
            }
        );
    }

    previousStage(): void {
        if (this.history.length > 1) {
            this.switchStage(null, { back: true });
        }
    }

    refreshShapes(): void {
        State.shapes.stage = this.stage.getShape();
    }

    private hashChange(): void {
        if (urlHash(HASH_ROOM).length === ROOM_KEY_LENGTH && 1 === this.history.length) {
            State.flow.restart();
        }
    }

    private handleKeys(ev: KeyboardEvent): void {
        // Firefox disconnects websocket on Esc. Disable that.
        // Also prevent the tab key focusing things outside canvas.
        if (ev.keyCode === KEY.ESCAPE || ev.keyCode === KEY.TAB) {
            ev.preventDefault();
        }

        // Ignore key when user is in input field. Start screen might
        // contain a dialog, so do not use State.keysBlocked here.
        if (!State.shapes.INPUT_CARET) {
            // Mute/Unmute
            if (ev.keyCode === KEY.MUTE) {
                const mute = !storage(STORAGE_MUTE) as boolean;
                storage(STORAGE_MUTE, mute);
                instruct("Sounds " + (mute ? "muted" : "unmuted"), 1000);
                State.audio.play("menu_alt");
            }
        }
    }

    private switchStageAnimate(oldShape: Shape, newShape: Shape, back: boolean, callback): void {
        let oldStageAnim;
        let newStageAnim;
        const width = WIDTH - MENU_LEFT;

        if (back) {
            oldStageAnim = { to: [width, 0] };
            newStageAnim = { from: [-width, 0] };
        } else {
            oldStageAnim = { to: [-width, 0] };
            newStageAnim = { from: [width, 0] };
        }

        newStageAnim.doneCallback = callback;

        State.audio.play(back ? "swoosh_rev" : "swoosh");
        State.shapes.oldstage = animate(oldShape, oldStageAnim);
        State.shapes.newstage = animate(newShape, newStageAnim);
    }

    private setStage(stage: StageInterface, back = false) {
        // Remove animated stages
        State.shapes.oldstage = null;
        State.shapes.newstage = null;

        this.stage = stage;
        this.stage.construct();
        this.refreshShapes();

        if (back) {
            this.history.pop();
            urlHash();
        } else {
            this.history.push(stage);
        }
    }
}

import { ROOM_KEY_LENGTH, CANVAS } from "../shared/const";
import { RoomOptions } from "../shared/room/roomOptions";
import { Shape } from "../shared/shape";
import { HASH_ROOM, KEY, MENU_LEFT, NS, STORAGE } from "./const";
import { ClientRoom } from "./room/clientRoom";
import { ClientSocketPlayer } from "./room/clientSocketPlayer";
import { StageConstructor, StageInterface } from "./stages/base/stage";
import { MainStage } from "./stages/mainStage";
import { State } from "./state";
import { outerBorder, xssnakeHeader } from "./ui/clientShapeGenerator";
import { fontLoad } from "./ui/font";
import { animate } from "./ui/shapeClient";
import { instruct, storage, urlHash } from "./util/clientUtil";

export interface FlowData {
    xss: string;
    name: string;
    clientPlayer: ClientSocketPlayer;
    room: ClientRoom;
    roomOptions: RoomOptions;
}

export class StageFlow {
    GameStage: StageConstructor;
    stage: StageInterface;
    data: FlowData = {
        xss: storage.get(STORAGE.XSS) as string,
        name: storage.get(STORAGE.NAME) as string,
        clientPlayer: undefined,
        roomOptions: undefined,
        room: undefined,
    };

    private history: StageInterface[] = [];

    constructor(private FirstStage = MainStage as StageConstructor) {
        this.data.roomOptions = new RoomOptions();
        fontLoad().then(() => {
            this.start();
        });
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

        this.setStage(new this.FirstStage(this.data), false);
    }

    switchStage(Stage: StageConstructor, options = { back: false }): void {
        let switchToStage;

        if (Stage && !options.back) {
            switchToStage = new Stage(this.data);
        } else {
            switchToStage = this.history[this.history.length - 2];
        }

        // Unload old stage
        this.stage.destruct();

        // Remove everything
        State.shapes.stage = undefined;

        // Replace by levelanim
        this.switchStageAnimate(
            this.stage.getShape(),
            switchToStage.getShape(),
            options.back,
            () => {
                this.setStage(switchToStage, options.back);
            },
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

    private handleKeys(event: KeyboardEvent): void {
        // Firefox disconnects websocket on Esc. Disable that.
        // Also prevent the tab key focusing objects outside the canvas.
        if (event.key === KEY.ESCAPE || event.key === KEY.TAB) {
            event.preventDefault();
        }

        // Ignore key when user is in input field. Start screen might
        // contain a dialog, so do not use State.keysBlocked here.
        // TODO: State.keysBlocked should be an enum for this reason.
        if (!State.shapes.INPUT_CARET) {
            // Mute/Unmute
            if (event.key === KEY.MUTE) {
                const mute = !storage.get(STORAGE.MUTE) as boolean;
                storage.set(STORAGE.MUTE, mute);
                instruct("Sounds " + (mute ? "muted" : "unmuted"), 1000);
                State.audio.play("menu_alt");
            }
        }
    }

    private switchStageAnimate(oldShape: Shape, newShape: Shape, back: boolean, callback): void {
        let oldStageAnim;
        let newStageAnim;
        const width = CANVAS.WIDTH - MENU_LEFT;

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
        State.shapes.oldstage = undefined;
        State.shapes.newstage = undefined;

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

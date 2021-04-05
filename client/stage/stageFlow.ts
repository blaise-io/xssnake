/**
 * StageFlow instantiation, stage switching
 * @param {Function=} Stage
 * @constructor
 */
import { ROOM_KEY_LENGTH, WIDTH } from "../../shared/const";
import { extend } from "../../shared/util";
import {
    DOM_EVENT_KEYDOWN, HASH_ROOM, KEY_ESCAPE, KEY_MUTE, KEY_TAB, MENU_LEFT, NS_FLOW, STORAGE_MUTE,
} from "../const";
import { MainStage } from "../stages/main";
import { StartGameStage } from "../stages/startGame";
import { State } from "../state/state";
import { outerBorder, xssnakeHeader } from "../ui/clientShapeGenerator";
import { animate } from "../ui/shapeClient";
import { instruct, storage, urlHash } from "../util/clientUtil";

export class StageFlow {
    GameStage: any;
    private stage: any;
    private _history: any[];
    private _FirstStage: any;

    constructor(stage = MainStage) {
        this._FirstStage = stage;
        this.GameStage = StartGameStage;
        this.start();
    }

    destruct() {
        this.stage.destruct();
        if (State.player) {
            State.player.destruct();
        }
        State.shapes = {};
        State.events.off(DOM_EVENT_KEYDOWN, NS_FLOW);
        State.canvas.garbageCollect();
    }

    restart() {
        this.destruct();
        this.start();
    }

    start() {
        this._history = [];

        window.onhashchange = this._hashChange.bind(this);
        State.events.on(DOM_EVENT_KEYDOWN, NS_FLOW, this._handleKeys.bind(this));

        Object.assign(State.shapes, outerBorder());

        State.shapes.HEADER = xssnakeHeader();

        this._setStage(new (this._FirstStage)(), false);
    }

    getData(): any {
        const value = {};
        for (let i = 0, m = this._history.length; i < m; i++) {
            extend(value, this._history[i].getData());
        }
        return value;
    }

    /**
     * @param {Function} Stage
     * @param {Object=} options
     */
    switchStage(Stage, options: any={}): void {
        let switchToStage;

        if (Stage && !options.back) {
            switchToStage = new Stage();
        } else {
            switchToStage = this._history[this._history.length - 2];
        }

        // Unload old stage
        this.stage.destruct();

        // Remove everything
        State.shapes.stage = null;

        // Replace by levelanim
        this._switchStageAnimate(
            this.stage.getShape(),
            switchToStage.getShape(),
            options.back,
            function() {
                this._setStage(switchToStage, options.back);
            }.bind(this)
        );
    }

    previousStage() {
        if (this._history.length > 1) {
            this.switchStage(null, {back: true});
        }
    }

    refreshShapes() {
        State.shapes.stage = this.stage.getShape();
    }

    private _hashChange(): void {
        if (
            urlHash(HASH_ROOM).length === ROOM_KEY_LENGTH &&
            1 === this._history.length
        ) {
            State.flow.restart();
        }
    }

    private _handleKeys(ev: KeyboardEvent): void {
        // Firefox disconnects websocket on Esc. Disable that.
        // Also prevent the tab key focusing things outside canvas.
        if (ev.keyCode === KEY_ESCAPE || ev.keyCode === KEY_TAB) {
            ev.preventDefault();
        }

        // Ignore key when user is in input field. Start screen might
        // contain a dialog, so do not use State.keysBlocked here.
        if (!State.shapes.INPUT_CARET) {
            // Mute/Unmute
            if (ev.keyCode === KEY_MUTE) {
                const mute = !storage(STORAGE_MUTE) as boolean;
                storage(STORAGE_MUTE, mute);
                instruct("Sounds " + (mute ? "muted" : "unmuted"), 1000);
                State.audio.play("menu_alt");
            }
        }
    }

    /**
     * @param {Shape} oldShape
     * @param {Shape} newShape
     * @param {boolean} back
     * @param {function()} callback
     * @private
     */
    _switchStageAnimate(oldShape, newShape, back, callback): void {
        let oldStageAnim; let newStageAnim; const width = WIDTH - MENU_LEFT;

        if (back) {
            oldStageAnim = {to: [width, 0]};
            newStageAnim = {from: [-width, 0]};
        } else {
            oldStageAnim = {to: [-width, 0]};
            newStageAnim = {from: [width, 0]};
        }

        newStageAnim.doneCallback = callback;

        if (back) {
            State.audio.play("swoosh_rev");
        } else {
            State.audio.play("swoosh");
        }

        State.shapes.oldstage = animate(oldShape, oldStageAnim);
        State.shapes.newstage = animate(newShape, newStageAnim);
    }

    // TODO: StageInterface
    private _setStage(stage: any, back: false) {
        // Remove animated stages
        State.shapes.oldstage = null;
        State.shapes.newstage = null;

        this.stage = stage;
        this.stage.construct();
        this.refreshShapes();

        if (back) {
            this._history.pop();
            urlHash();
        } else {
            this._history.push(stage);
        }
    }

}

import { HEIGHT, WIDTH } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { average } from "../../shared/util";
import { colorSchemes } from "../bootstrap/registerColorSchemes";
import {
    EV_GAME_TICK,
    EV_WIN_FOCUS_CHANGE,
    MAX_FRAME_DELTA,
    MIN_FRAME_DELTA,
    STORAGE_COLOR,
} from "../const";
import { State } from "../state";
import { debounce, instruct, storage } from "../util/clientUtil";
import { CanvasTile } from "./canvasTile";
import { ColorScheme } from "./colorScheme";
import { ShapeCache } from "./shapeCache";
import { applyEffects } from "./shapeClient";

export class Canvas {
    fps: any;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    tile: CanvasTile;
    focus: boolean;
    _prevFrame: any;
    canvasWidth: number;
    canvasHeight: number;
    private error: boolean;

    constructor() {
        const color = storage(STORAGE_COLOR) as number;

        this.fps = [];
        this.canvas = this._setupCanvas();
        this.context = this.canvas.getContext("2d");
        this.tile = new CanvasTile(colorSchemes[color] || colorSchemes[0]);

        this._setCanvasDimensions();
        this._positionCanvas();
        this._bindEvents();

        this.focus = true;
        this._prevFrame = new Date();

        window.requestAnimationFrame((now) => {
            this._frame(now);
        });

        window.onerror = (error) => {
            this.error = true;
            console.error(error);
        };
    }

    setColorScheme(colorScheme: ColorScheme): void {
        this.tile.setColorScheme(colorScheme);
        this._flushShapeCache();
    }

    paint(delta: number): void {
        // Abuse this loop to trigger game tick
        State.events.trigger(EV_GAME_TICK, delta, this.focus);

        // Clear canvas
        this._clear();

        // Paint all layers
        this._paintShapes(delta);
    }

    /**
     * Remove all nulled shapes. We don't delete shapes immediately
     * because this triggers a slow garbage collection during gameplay,
     * which may affect framerate negatively.
     */
    garbageCollect(): void {
        const shapes = State.shapes;
        for (const k in shapes) {
            if (null === shapes[k]) {
                delete shapes[k];
            }
        }
    }

    _flushShapeCache(): void {
        const shapes = State.shapes;
        for (const k in shapes) {
            if (null !== shapes[k]) {
                shapes[k].uncache();
            }
        }
    }

    _clear() {
        this.context.save();
        this.context.fillStyle = this.tile.off;
        this.context.globalAlpha = 1 - this.tile.colorScheme.ghosting;
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.context.restore();
    }

    /**
     * @param {number} delta
     * @private
     */
    _paintShapes(delta): void {
        const overlays = [];
        const shapeKeys = Object.keys(State.shapes);

        // Avoid looping over an uncached keyval object.
        for (let i = 0, m = shapeKeys.length; i < m; i++) {
            this._paintDispatch(delta, overlays, shapeKeys[i]);
        }

        this._paintOverlays(delta, overlays);
    }

    /**
     * @param {number} delta
     * @param {Array.<Shape>} overlays
     * @param {string} key
     * @private
     */
    _paintDispatch(delta, overlays, key): void {
        if (State.shapes[key]) {
            if (State.shapes[key].flags.isOverlay) {
                overlays.push(State.shapes[key]);
            } else {
                this._paintShape(State.shapes[key], delta);
            }
        }
    }

    /**
     * @param {number} delta
     * @param {Array.<Shape>} overlays
     * @private
     */
    _paintOverlays(delta, overlays): void {
        for (let i = 0, m = overlays.length; i < m; i++) {
            this._paintShape(overlays[i], delta);
        }
    }

    private _frame(now: number): void {
        // Make appointment for next paint.
        if (!this.error) {
            window.requestAnimationFrame((now) => {
                this._frame(now);
            });
        }

        // Time since last paint
        const delta = now - this._prevFrame;
        this._prevFrame = now;

        // Show FPS in title bar
        // this.reportFps(1000 / delta);

        this.paint(delta);
    }

    reportFps(fps: number): void {
        this.fps.unshift(fps);
        this.fps.length = 10;
        document.title = "XXSNAKE " + Math.round(average(this.fps));
    }

    /**
     * @param {Shape} shape
     * @param {number} delta
     * @private
     */
    _paintShape(shape, delta): void {
        const translate = shape.transform.translate;

        // Apply effects if FPS is in a normal range. If window is out
        // of focus, we don't want animations. Also we do not want anims
        // if a browser is "catching up" frames after being focused after
        // a blur, where it tries to make up for slow frames.
        if (delta > MIN_FRAME_DELTA && delta < MAX_FRAME_DELTA) {
            applyEffects(shape, delta);
        }

        // Draw on canvas if shape is enabled and visible
        if (!shape.flags.enabled) {
            return;
        }

        // Create cache
        if (!shape.cache) {
            shape.cache = new ShapeCache(shape, this.tile);
        }

        if (shape.mask) {
            // A mask specifies a bounding box (x0, y0, x1, y1)
            // where anything outside will not get drawn.
            this._drawMaskedShape(shape);
        } else {
            // Paint cached image on canvas
            this.context.drawImage(
                shape.cache.canvas,
                shape.cache.bbox.x0 + translate[0] * this.tile.size,
                shape.cache.bbox.y0 + translate[1] * this.tile.size
            );
        }
    }

    private _drawMaskedShape(shape: Shape): void {
        const translate = shape.transform.translate;

        const mx0 = shape.mask[0] * this.tile.size;
        const my0 = shape.mask[1] * this.tile.size;
        const mx1 = shape.mask[2] * this.tile.size;
        const my1 = shape.mask[3] * this.tile.size;

        let sx = 0;
        let sy = 0;
        let width = shape.cache.bbox.width + this.tile.size;
        let height = shape.cache.bbox.height + this.tile.size;

        let dx = shape.cache.bbox.x0 + translate[0] * this.tile.size;
        let dy = shape.cache.bbox.y0 + translate[1] * this.tile.size;

        // Cut top off
        if (dy < my0) {
            sy = my0 - dy;
            dy += sy;
            height -= sy;
        }

        // Cut left off
        if (dx < mx0) {
            sx = mx0 - dx;
            dx += sx;
            width -= sx;
        }

        // Cut bottom off
        if (dy + height > my1) {
            height -= dy + height - my1;
        }

        // Cut right off
        if (dx + width > mx1) {
            width -= dx + width - mx1;
        }

        this.context.drawImage(shape.cache.canvas, sx, sy, width, height, dx, dy, width, height);
    }

    private _bindEvents(): void {
        this.canvas.onclick = this._promoteKeyboard.bind(this);
        window.onresize = debounce(() => {
            this._setCanvasDimensions();
            this._flushShapeCache();
            this._positionCanvas();
        }, 20);
        window.onfocus = this._handleFocusChange.bind(this);
        window.onblur = this._handleFocusChange.bind(this);
    }

    private _handleFocusChange(ev: Event): void {
        this.focus = ev.type !== "blur";
        State.events.trigger(EV_WIN_FOCUS_CHANGE, this.focus);
    }

    _promoteKeyboard(ev: KeyboardEvent): void {
        if (Number(ev.which) !== 1) {
            // Only LMB
            return;
        }
        instruct("No mousing please", 2000);
    }

    private _setCanvasDimensions(): void {
        const size = this.tile.updateSize();
        this.canvasWidth = size * WIDTH;
        this.canvasHeight = size * HEIGHT;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.canvas.style.width = `${this.canvasWidth / window.devicePixelRatio}px`;
        this.canvas.style.height = `${this.canvasHeight / window.devicePixelRatio}px`;
    }

    private _positionCanvas(): void {
        const windowCenter = window.innerWidth / 2;
        const windowMiddle = window.innerHeight / 2;

        const offset = 2 * window.devicePixelRatio;

        const left = this._snapCanvasToTiles(windowCenter - this.canvasWidth / offset);
        const top = this._snapCanvasToTiles(windowMiddle - this.canvasHeight / offset);

        const style = this.canvas.style;
        style.position = "absolute";
        style.left = Math.max(0, left) + "px";
        style.top = Math.max(0, top) + "px";
    }

    private _setupCanvas(): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        return canvas;
    }

    private _snapCanvasToTiles(num: number): number {
        return Math.floor(num / this.tile.size) * this.tile.size;
    }
}

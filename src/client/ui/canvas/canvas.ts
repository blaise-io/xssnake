import { CANVAS } from "../../../shared/const";
import { Shape } from "../../../shared/shape";
import { colorSchemes } from "../../bootstrap/registerColorSchemes";
import { EV_GAME_TICK, MAX_FRAME_DELTA, MIN_FRAME_DELTA, STORAGE } from "../../const";
import { globalEventHandler } from "../../netcode/eventHandler";
import { State } from "../../state";
import { debounce, instruct, storage } from "../../util/clientUtil";
import { CanvasTile } from "./canvasTile";
import { ColorScheme } from "../colorScheme";
import { ShapeCache } from "./shapeCache";
import { applyEffects } from "../shapeClient";

export class Canvas {
    private fps: number[] = [];
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private tile: CanvasTile;
    focus = true;
    private prevFrame = new Date().getTime();
    private stopRendering = false;

    constructor() {
        const color = storage.get(STORAGE.COLOR) as number;

        this.canvas = this.setupCanvas();
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.tile = new CanvasTile(colorSchemes[color] || colorSchemes[0]);

        this.setCanvasDimensions();
        this.positionCanvas();
        this.bindEvents();

        window.requestAnimationFrame((now) => {
            this.drawFrame(now);
        });

        window.onerror = () => {
            this.stopRendering = true;
        };
    }

    setColorScheme(colorScheme: ColorScheme): void {
        this.tile.setColorScheme(colorScheme);
        this.flushShapeCache();
    }

    paint(delta: number): void {
        // Abuse this loop to trigger game tick
        // TODO: Separate message
        globalEventHandler.trigger(EV_GAME_TICK, delta, this.focus);

        // Clear canvas
        this.clear();

        // Paint all layers
        this.paintShapes(delta);
    }

    /**
     * Remove all undefined shapes. We don't delete shapes on-the-fly
     * because this triggers garbage collection that affects fps.
     */
    garbageCollect(): void {
        const shapes = State.shapes;
        for (const k in shapes) {
            if (!shapes[k]) {
                delete shapes[k];
            }
        }
    }

    private flushShapeCache(): void {
        const shapes = State.shapes;
        for (const k in shapes) {
            if (shapes[k]) {
                shapes[k].uncache();
            }
        }
    }

    private clear(): void {
        this.context.save();
        this.context.fillStyle = this.tile.off as CanvasPattern;
        this.context.globalAlpha = 1 - this.tile.colorScheme.ghosting;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
    }

    private paintShapes(delta: number): void {
        const overlays: Shape[] = [];
        const shapeKeys = Object.keys(State.shapes);

        for (let i = 0, m = shapeKeys.length; i < m; i++) {
            this.paintDispatch(delta, overlays, shapeKeys[i]);
        }

        this.paintOverlays(delta, overlays);
    }

    private paintDispatch(delta: number, overlays: Shape[], key: string): void {
        if (State.shapes[key]) {
            if (State.shapes[key].flags.isOverlay) {
                overlays.push(State.shapes[key]);
            } else {
                this.paintShape(State.shapes[key], delta);
            }
        }
    }

    private paintOverlays(delta: number, overlays: Shape[]): void {
        for (let i = 0, m = overlays.length; i < m; i++) {
            this.paintShape(overlays[i], delta);
        }
    }

    private drawFrame(now: number): void {
        // Make appointment for next paint.
        if (!this.stopRendering) {
            window.requestAnimationFrame((now) => {
                this.drawFrame(now);
            });
        }

        // Time since last paint
        const delta = now - this.prevFrame;
        this.prevFrame = now;

        // Show FPS in title bar
        this.reportFps(1000 / delta);

        this.paint(delta);
    }

    reportFps(fps: number): void {
        this.fps.unshift(fps);
        this.fps.length = 10;
        // document.title = "XXSNAKE " + Math.round(average(this.fps));
    }

    private paintShape(shape: Shape, delta: number): void {
        const translate = shape.transform.translate;

        // Apply effects if FPS is in a normal range. If window is out
        // of focus, we don't want animations. Also we do not want animations
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

        if (shape.mask.length) {
            // A mask specifies a bounding box (x0, y0, x1, y1)
            // where anything outside will not get drawn.
            this.drawMaskedShape(shape);
        } else {
            // Paint cached image on canvas
            const cache = shape.cache as ShapeCache;
            this.context.drawImage(
                cache.canvas,
                cache.bbox.x0 + translate[0] * this.tile.size,
                cache.bbox.y0 + translate[1] * this.tile.size,
            );
        }
    }

    private drawMaskedShape(shape: Shape): void {
        const translate = shape.transform.translate;
        const cache = shape.cache as ShapeCache;

        const mx0 = shape.mask[0] * this.tile.size;
        const my0 = shape.mask[1] * this.tile.size;
        const mx1 = shape.mask[2] * this.tile.size;
        const my1 = shape.mask[3] * this.tile.size;

        let sx = 0;
        let sy = 0;
        let width = cache.bbox.width + this.tile.size;
        let height = cache.bbox.height + this.tile.size;

        let dx = cache.bbox.x0 + translate[0] * this.tile.size;
        let dy = cache.bbox.y0 + translate[1] * this.tile.size;

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

        this.context.drawImage(cache.canvas, sx, sy, width, height, dx, dy, width, height);
    }

    private bindEvents(): void {
        this.canvas.onclick = this.promoteKeyboard.bind(this);
        window.onresize = debounce(() => {
            this.setCanvasDimensions();
            this.flushShapeCache();
            this.positionCanvas();
        }, 20);
        window.onfocus = this.handleFocusChange.bind(this);
        window.onblur = this.handleFocusChange.bind(this);
    }

    private handleFocusChange(ev: Event): void {
        this.focus = ev.type !== "blur";
        console.log("focus", this.focus);
        // TODO: Handle?
    }

    private promoteKeyboard(event: MouseEvent): void {
        if (event.button === 0) {
            instruct("No mousing please", 0, 2);
        }
    }

    private setCanvasDimensions(): void {
        const size = this.tile.updateSize();
        const canvasWidth = size * CANVAS.WIDTH;
        const canvasHeight = size * CANVAS.HEIGHT;
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.width = `${canvasWidth / window.devicePixelRatio}px`;
        this.canvas.style.height = `${canvasHeight / window.devicePixelRatio}px`;
    }

    private positionCanvas(): void {
        const windowCenter = window.innerWidth / 2;
        const windowMiddle = window.innerHeight / 2;

        const offset = 2 * window.devicePixelRatio;

        const left = this.snapCanvasToTiles(windowCenter - this.canvas.width / offset);
        const top = this.snapCanvasToTiles(windowMiddle - this.canvas.height / offset);

        const style = this.canvas.style;
        style.position = "absolute";
        style.left = Math.max(0, left) + "px";
        style.top = Math.max(0, top) + "px";
    }

    private setupCanvas(): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        return canvas;
    }

    private snapCanvasToTiles(num: number): number {
        return Math.floor(num / this.tile.size) * this.tile.size;
    }
}

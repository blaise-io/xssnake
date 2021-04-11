import { GAME_LEFT, GAME_TILE, GAME_TOP, HEIGHT, WIDTH } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { getKey } from "../../shared/util";
import { FRAME } from "../const";
import { State } from "../state/state";

export function center(shape: Shape, width = WIDTH, height = HEIGHT): void {
    const bbox = shape.bbox();

    const x = Math.round((width - bbox.width) / 2);
    const y = Math.round((height - bbox.height) / 2);

    shape.transform.translate = [x - bbox.x0, y - bbox.y0];
}

export function setGameTransform(shape: Shape): void {
    shape.transform.scale = GAME_TILE;
    shape.transform.translate[0] = shape.transform.translate[0] * GAME_TILE + GAME_TILE / GAME_LEFT;
    shape.transform.translate[1] = shape.transform.translate[1] * GAME_TILE + GAME_TILE / GAME_TOP;
}

export function flash(shape: Shape, on: number = FRAME * 24, off: number = FRAME * 6): Shape {
    let progress = 0;
    const duration = [on, off];

    shape.effects.flash = (delta) => {
        progress += delta;
        if (progress > duration[+!shape.flags.enabled]) {
            progress -= duration[+!shape.flags.enabled];
            shape.flags.enabled = !shape.flags.enabled;
        }
    };

    return shape;
}

export function lifetime(shape: Shape, start: number, end?: number): Shape {
    let progress = 0;
    let started = false;

    shape.effects.lifetime = (delta) => {
        // Start time reached.
        if (start && progress >= start && !started) {
            started = true;
            shape.flags.enabled = true;
        }

        // Stop time reached.
        if (end && progress >= end) {
            const key = getKey(State.shapes, shape);
            if (key) {
                State.shapes[key] = null;
            }
        }

        progress += delta;
    };

    return shape;
}

export function animate(
    shape: Shape,
    options: {
        from?: Coordinate;
        to?: Coordinate;
        duration?: number;
        doneCallback?: (shape: Shape) => void;
        progressCallback?: (shape: Shape, x: number, y: number) => void;
    }
): Shape {
    let progress = 0;
    options = {
        from: [0, 0],
        to: [0, 0],
        duration: 200,
        doneCallback: () => {},
        progressCallback: () => {},
        ...options,
    };

    shape.effects.animate = (delta) => {
        progress += delta;
        const percent = Math.sqrt(progress / options.duration);
        if (progress < options.duration) {
            const x = Math.round(options.from[0] - (options.from[0] - options.to[0]) * percent);
            const y = Math.round(options.from[1] - (options.from[1] - options.to[1]) * percent);
            shape.transform.translate = [x, y];
            options.progressCallback(shape, x, y);
        } else {
            shape.transform.translate = options.to;
            delete shape.effects.animate;
            options.doneCallback(shape);
        }
    };

    return shape;
}

export function applyEffects(shape: Shape, delta: number): void {
    for (const k in shape.effects) {
        shape.effects[k](delta);
    }
}

import { GAME, CANVAS } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { noop } from "../../shared/util";
import { State } from "../state";

export function center(
    shape: Shape,
    width = CANVAS.WIDTH,
    height = CANVAS.HEIGHT,
    reset = false,
): void {
    const bbox = shape.bbox();

    const x = Math.round((width - bbox.width) / 2);
    const y = Math.round((height - bbox.height) / 2.5); // Intentional, looks better.

    if (reset) {
        shape.transform.translate = [x - bbox.x0, y - bbox.y0];
    } else {
        shape.transform.translate[0] += x - bbox.x0;
        shape.transform.translate[1] += y - bbox.y0;
    }
}

export function setGameTransform(shape: Shape): Shape {
    const transform = shape.transform;
    if (transform.scale != GAME.TILE) {
        transform.scale = GAME.TILE;
        transform.translate[0] = transform.translate[0] * GAME.TILE + GAME.TILE / GAME.LEFT;
        transform.translate[1] = transform.translate[1] * GAME.TILE + GAME.TILE / GAME.TOP;
    }
    return shape;
}

export function flash(shape: Shape, on = 300, off = 100): Shape {
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
    shape.flags.enabled = false;
    shape.effects.lifetime = (delta) => {
        progress += delta;

        // Start time reached.
        if (progress >= start && !started) {
            started = true;
            shape.flags.enabled = true;
        }

        // Stop time reached.
        if (end && progress >= end) {
            Object.entries(State.shapes).forEach(([key, _shape]) => {
                if (_shape === shape) {
                    delete State.shapes[key];
                }
            });
        }
    };

    return shape;
}

export type StageAnimateOptions = {
    from: Coordinate;
    to: Coordinate;
    duration: number;
    doneCallback: (shape: Shape) => void;
    progressCallback: (shape: Shape, x: number, y: number) => void;
};

export function animate(shape: Shape, options: Partial<StageAnimateOptions>): Shape {
    let progress = 0;

    const _options: StageAnimateOptions = {
        from: [0, 0],
        to: [0, 0],
        duration: 200,
        doneCallback: noop,
        progressCallback: noop,
    };
    Object.assign(_options, options);

    shape.effects.animate = (delta) => {
        progress += delta;
        const percent = Math.sqrt(progress / _options.duration);
        if (progress < _options.duration) {
            const x = Math.round(_options.from[0] - (_options.from[0] - _options.to[0]) * percent);
            const y = Math.round(_options.from[1] - (_options.from[1] - _options.to[1]) * percent);
            shape.transform.translate = [x, y];
            _options.progressCallback(shape, x, y);
        } else {
            shape.transform.translate = _options.to;
            delete shape.effects.animate;
            _options.doneCallback(shape);
        }
    };

    return shape;
}

export function applyEffects(shape: Shape, delta: number): void {
    for (const k in shape.effects) {
        shape.effects[k](delta);
    }
}

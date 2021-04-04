import {
    DIRECTION_DOWN,
    DIRECTION_LEFT,
    DIRECTION_RIGHT,
    DIRECTION_UP,
    GAME_TILE,
    HEIGHT,
    WIDTH
} from "../../shared/const";
import { PixelCollection } from "../../shared/pixelCollection";
import { Shape } from "../../shared/shape";
import { line } from "../../shared/shapeGenerator";
import { randomRange, randomStr } from "../../shared/util";
import { MENU_LEFT, MENU_TOP, MENU_WIDTH, NS_ACTION, NS_EXPLOSION } from "../const";
import { State } from "../state/state";
import { font, fontWidth } from "./font";
import { animate, lifetime } from "./shapeClient";
import { zoom } from "./transformClient";

/**
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} direction
 * @return {Shape}
 */
export function tooltip(text, x, y, direction) {
    let width; let shape; let hw;

    width = fontWidth(text);

    switch (direction) {
    case 0:
        shape = font(text, x - width - 6, y - 4);
        // Left
        shape.add(line(x - width - 9, y - 5, x - width - 9, y + 3));
        // Top
        shape.add(line(x - width - 8, y - 6, x - 6, y - 6));
        // Bottoms
        shape.add(line(x - width - 9, y + 4, x - 5, y + 4));
        shape.add(line(x - width - 8, y + 5, x - 6, y + 5));
        // Top 1px
        shape.add(line(x - 5, y - 5, x - 5, y - 5));
        // Pointer
        shape.add(line(x - 5, y - 4, x - 2, y - 1));
        shape.add(line(x - 5, y + 2, x - 2, y - 1));
        shape.add(line(x - 5, y + 3, x - 2, y));
        break;
    case 1:
        hw = Math.ceil(width / 2);
        shape = font(text, x - hw, y - 13);
        // Top
        shape.add(line(x - hw - 2, y - 15, x + hw + 1, y - 15));
        // Left
        shape.add(line(x - hw - 3, y - 5, x - hw - 3, y - 14));
        // Bottoms
        shape.add(line(x + -hw - 2, y - 4, x + hw + 1, y - 4));
        shape.add(line(x + -hw - 2, y - 5, x + hw + 1, y - 5));
        // Right
        shape.add(line(x + hw + 2, y - 5, x + hw + 2, y - 14));
        // Pointer
        shape.add(line(x - 1, y - 1, x - 4, y - 4));
        shape.add(line(x - 1, y - 2, x - 4, y - 5));
        shape.add(line(x, y - 1, x + 3, y - 4));
        shape.add(line(x, y - 2, x + 3, y - 5));
        shape.remove(line(x - 3, y - 4, x + 3, y - 4));
        shape.remove(line(x - 3, y - 5, x + 3, y - 5));
        break;
    case 2:
        shape = font(text, x + 8, y - 4);
        // Right
        shape.add(line(x + width + 9, y - 5, x + width + 9, y + 3));
        // Top
        shape.add(line(x + width + 8, y - 6, x + 6, y - 6));
        // Bottom
        shape.add(line(x + width + 9, y + 4, x + 5, y + 4));
        shape.add(line(x + width + 8, y + 5, x + 6, y + 5));
        // Top 1px
        shape.add(line(x + 5, y - 5, x + 5, y - 5));
        // Pointer
        shape.add(line(x + 5, y - 4, x + 2, y - 1));
        shape.add(line(x + 5, y + 2, x + 2, y - 1));
        shape.add(line(x + 5, y + 3, x + 2, y));
        break;
    case 3:
        hw = Math.ceil(width / 2);
        shape = font(text, x - hw, y + 6);
        // Top
        shape.add(line(x + -hw - 2, y + 4, x + hw + 1, y + 4));
        // Left
        shape.add(line(x - hw - 3, y + 5, x - hw - 3, y + 14));
        // Bottoms
        shape.add(line(x - hw - 2, y + 14, x + hw + 1, y + 14));
        shape.add(line(x - hw - 2, y + 15, x + hw + 1, y + 15));
        // Right
        shape.add(line(x + hw + 2, y + 5, x + hw + 2, y + 14));
        // Pointer
        shape.add(line(x - 1, y + 1, x - 4, y + 4));
        shape.add(line(x, y + 1, x + 3, y + 4));
        shape.remove(line(x - 3, y + 4, x + 3, y + 4));
        break;
    }
    shape.isOverlay = true;
    shape.bbox();
    return shape;
}

/**
 * @param {string} text
 * @param {Coordinate} part
 * @param {number} direction
 * @return {Shape}
 */
export function tooltipName(text, part, direction) {
    let x; let y; const t = GAME_TILE; const d = GAME_TILE * 2.5;

    x = part[0] * t;
    y = part[1] * t;

    switch (direction) {
    case DIRECTION_LEFT:  y += t; x -= t; break;
    case DIRECTION_UP:    y -= t; x += t; break;
    case DIRECTION_RIGHT: y += t; x += d; break;
    case DIRECTION_DOWN:  y += d; x += t; break;
    }

    return tooltip(text, x, y, direction);
}

/**
 * @param {string} label
 * @param {Coordinate} coordinate
 * @param {number} duration
 * @param {number=} amount
 */
export function showAction(label, coordinate, duration, amount=3) {
    for (let s = 0; s <= duration * amount; s += duration) {
        var shape; var name;
        shape = font(
            label,
            coordinate[0] * GAME_TILE + randomRange(-12, 12),
            coordinate[1] * GAME_TILE + randomRange(-12, 12)
        );
        name = NS_ACTION + randomStr();
        State.shapes[name] = lifetime(shape, s, s + duration);
    }
}

/**
 * @return {Shape}
 */
export function innerBorder() {
    const w = WIDTH - 1;
    const h = HEIGHT - 1;
    return new Shape(
        line(2, h - 25, w - 2, h - 25),
        line(2, h - 26, w - 2, h - 26)
    );
}

export function outerBorder(): Record<string, Shape> {
    const w = WIDTH - 1;
    const h = HEIGHT - 1;

    return {
        outerBorderTop: new Shape(
            line(1, 0, w - 1, 0),
            line(0, 1, w, 1)
        ),
        outerBorderRight: new Shape(
            line(w, 2, w, h - 2),
            line(w - 1, 2, w - 1, h - 2)
        ),
        outerBorderBottom: new Shape(
            line(1, h, w - 1, h),
            line(0, h - 1, w, h - 1)
        ),
        outerBorderLeft: new Shape(
            line(0, 2, 0, h - 2),
            line(1, 2, 1, h - 2)
        ),
    };
}

/**
 * @return {Shape}
 */
export function xssnakeHeader() {
    let x; let y; let shape; const welcome = font("<XSSNAKE>").pixels;

    x = MENU_LEFT - 2;
    y = MENU_TOP - 34;

    shape = new Shape(zoom(4, welcome, x, y));
    x += 2;
    y += 28;
    shape.add(line(x, y, x + MENU_WIDTH, y));

    return shape;
}

/**
 * @param {Coordinate} location
 * @param {number=} direction
 * @param {number=} intensity
 */
export function explosion(location, direction, intensity=16) {
    let pixel; let shape; let to; let duration; let w; let d;

    w = 10;
    d = 20;

    while (intensity--) {
        switch (direction) {
        case DIRECTION_LEFT:
            to = [randomRange(-w, d), randomRange(-w, w)];
            break;
        case DIRECTION_UP:
            to = [randomRange(-w, w), randomRange(-d, w)];
            break;
        case DIRECTION_RIGHT:
            to = [randomRange(-d, w), randomRange(-w, w)];
            break;
        case DIRECTION_DOWN:
            to = [randomRange(-w, w), randomRange(-w, d)];
            break;
        default:
            to = [randomRange(-d, d), randomRange(-d, d)];
        }

        pixel = new PixelCollection().add(location[0], location[1]);
        duration = Math.pow(randomRange(1, 10), 3);

        shape = new Shape(pixel);
        animate(shape, {to: to, duration: duration});
        lifetime(shape, 0, duration);
        State.shapes[NS_EXPLOSION + randomStr(3)] = shape;
    }
}

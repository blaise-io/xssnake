import { CANVAS, DIRECTION, GAME } from "../../shared/const";
import { PixelCollection } from "../../shared/pixelCollection";
import { Shape } from "../../shared/shape";
import { line } from "../../shared/shapeGenerator";
import { randomRange, randomStr } from "../../shared/util";
import { MENU_POS, NS } from "../const";
import { State } from "../state";
import { font, fontWidth } from "./font";
import { animate, lifetime } from "./shapeClient";
import { zoom } from "./transformClient";

export function tooltip(text: string, x: number, y: number, direction: DIRECTION): Shape {
    let shape: Shape;
    let hw: number;
    const width = fontWidth(text);
    switch (direction) {
        case DIRECTION.LEFT:
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
        case DIRECTION.UP:
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
        case DIRECTION.RIGHT:
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
        case DIRECTION.DOWN:
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
    shape.flags.isOverlay = true;
    shape.bbox();
    return shape;
}

export function tooltipName(text: string, part: Coordinate, direction: DIRECTION): Shape {
    const distance = GAME.TILE * 2.5;

    let x = part[0] * GAME.TILE;
    let y = part[1] * GAME.TILE;

    switch (direction) {
        case DIRECTION.LEFT:
            y += GAME.TILE;
            x -= GAME.TILE;
            break;
        case DIRECTION.UP:
            y -= GAME.TILE;
            x += GAME.TILE;
            break;
        case DIRECTION.RIGHT:
            y += GAME.TILE;
            x += distance;
            break;
        case DIRECTION.DOWN:
            y += distance;
            x += GAME.TILE;
            break;
    }

    return tooltip(text, x, y, direction);
}

export function showAction(
    label: string,
    coordinate: Coordinate,
    duration = 200,
    amount = 3,
): void {
    for (let s = 0; s <= duration * amount; s += duration) {
        const shape = font(
            label,
            coordinate[0] * GAME.TILE + randomRange(-12, 12),
            coordinate[1] * GAME.TILE + randomRange(-12, 12),
        );
        const name = NS.ACTION + randomStr();
        State.shapes[name] = lifetime(shape, s, s + duration);
    }
}

export function innerBorder(): Shape {
    const w = CANVAS.WIDTH - 1;
    const h = CANVAS.HEIGHT - 1;
    return new Shape(line(2, h - 25, w - 2, h - 25), line(2, h - 26, w - 2, h - 26));
}

export function outerBorder(): Record<string, Shape> {
    const w = CANVAS.WIDTH - 1;
    const h = CANVAS.HEIGHT - 1;

    return {
        outerBorderTop: new Shape(line(1, 0, w - 1, 0), line(0, 1, w, 1)),
        outerBorderRight: new Shape(line(w, 2, w, h - 2), line(w - 1, 2, w - 1, h - 2)),
        outerBorderBottom: new Shape(line(1, h, w - 1, h), line(0, h - 1, w, h - 1)),
        outerBorderLeft: new Shape(line(0, 2, 0, h - 2), line(1, 2, 1, h - 2)),
    };
}

export function xssnakeHeader(): Shape {
    const welcome = font("<XSSNAKE>").pixels;

    let x = MENU_POS.LEFT - 2;
    let y = MENU_POS.TOP - 34;
    const shape = new Shape(zoom(4, welcome, x, y));
    x += 2;
    y += 28;
    shape.add(line(x, y, x + MENU_POS.WIDTH, y));

    return shape;
}

export function explosion(location: Coordinate, direction = -1, intensity = 16): void {
    let to;
    const w = 10;
    const d = 20;
    while (intensity--) {
        switch (direction) {
            case DIRECTION.LEFT:
                to = [randomRange(-w, d), randomRange(-w, w)];
                break;
            case DIRECTION.UP:
                to = [randomRange(-w, w), randomRange(-d, w)];
                break;
            case DIRECTION.RIGHT:
                to = [randomRange(-d, w), randomRange(-w, w)];
                break;
            case DIRECTION.DOWN:
                to = [randomRange(-w, w), randomRange(-w, d)];
                break;
            default:
                to = [randomRange(-d, d), randomRange(-d, d)];
        }

        const pixel = new PixelCollection().add(location[0], location[1]);
        const duration = Math.pow(randomRange(1, 10), 3);
        const shape = new Shape(pixel);
        animate(shape, { to: to, duration: duration });
        lifetime(shape, 0, duration);
        State.shapes[NS.EXPLOSION + randomStr(3)] = shape;
    }
}

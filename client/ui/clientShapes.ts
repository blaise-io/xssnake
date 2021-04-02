'use strict';

import { DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP, HEIGHT, WIDTH } from "../../shared/const";
import { line } from "../../shared/shapeGenerator";
import { randomRange, randomStr } from "../../shared/util";
import { MENU_LEFT, MENU_TOP, NS_ACTION, NS_EXPLOSION } from "../const";
import { State } from "../state/state";

/**
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} direction
 * @return {xss.Shape}
 */
export function tooltip(text, x, y, direction) {
    var width, shape, hw;

    width = xss.font.width(text);

    switch (direction) {
        case 0:
            shape = xss.font.shape(text, x - width - 6, y - 4);
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
            shape = xss.font.shape(text, x - hw, y - 13);
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
            shape = xss.font.shape(text, x + 8, y - 4);
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
            shape = xss.font.shape(text, x - hw, y + 6);
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
 * @param {xss.Coordinate} part
 * @param {number} direction
 * @return {xss.Shape}
 */
export function tooltipName(text, part, direction) {
    var x, y, t = xss.GAME_TILE, d = xss.GAME_TILE * 2.5;

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
 * @param {xss.Coordinate} coordinate
 * @param {number} duration
 * @param {number=} amount
 */
export function showAction(label, coordinate, duration, amount) {
    amount = amount || 3;

    var randomRange = function() {
        return randomRangeomRange(-12, 12);
    };

    for (var s = 0; s <= duration * amount; s += duration) {
        var shape, name;
        shape = xss.font.shape(
            label,
            coordinate[0] * xss.GAME_TILE + randomRange(),
            coordinate[1] * xss.GAME_TILE + randomRange()
        );
        name = NS_ACTION + randomRangeomStr();
        State.shapes[name] = shape.lifetime(s, s + duration);
    }
}

/**
 * @return {xss.Shape}
 */
export function innerBorderfunction() {
    var w = WIDTH - 1,
        h = HEIGHT - 1;
    return new xss.Shape(
        this.line(2, h - 25, w - 2, h - 25),
        this.line(2, h - 26, w - 2, h - 26)
    );
}

/**
 * @param {function(string, xss.Shape)} callbackFn
 */
export function outerBorder(callbackFn) {
    var shapes: any = {}, w, h;

    w = WIDTH - 1;
    h = HEIGHT - 1;

    // Splitting this up or it spans too big of an area
    shapes.outerBorderTop = new xss.Shape(
        this.line(1, 0, w - 1, 0),
        this.line(0, 1, w, 1)
    );

    shapes.outerBorderRight = new xss.Shape(
        this.line(w, 2, w, h - 2),
        this.line(w - 1, 2, w - 1, h - 2)
    );

    shapes.outerBorderBottom = new xss.Shape(
        this.line(1, h, w - 1, h),
        this.line(0, h - 1, w, h - 1)
    );

    shapes.outerBorderLeft = new xss.Shape(
        this.line(0, 2, 0, h - 2),
        this.line(1, 2, 1, h - 2)
    );

    for (var k in shapes) {
        if (shapes.hasOwnProperty(k)) {
            callbackFn(k, shapes[k]);
        }
    }
}

/**
 * @return {xss.Shape}
 */
export function header() {
    var x, y, shape, welcome = xss.font.pixels('<XSSNAKE>');

    x = MENU_LEFT - 2;
    y = MENU_TOP - 34;

    shape = new xss.Shape(xss.transform.zoom(4, welcome, x, y));
    x += 2;
    y += 28;
    shape.add(this.line(x, y, x + xss.MENU_WIDTH, y));

    return shape;
}

/**
 * @param {xss.Coordinate} location
 * @param {number=} direction
 * @param {number=} intensity
 */
export function explosion(location, direction, intensity) {
    var pixel, shape, to, duration, w, d;

    w = 10;
    d = 20;

    intensity = intensity || 16;
    while (intensity--) {
        switch (direction) {
            case xss.DIRECTION_LEFT:
                to = [randomRange(-w, d), randomRange(-w, w)];
                break;
            case xss.DIRECTION_UP:
                to = [randomRange(-w, w), randomRange(-d, w)];
                break;
            case xss.DIRECTION_RIGHT:
                to = [randomRange(-d, w), randomRange(-w, w)];
                break;
            case xss.DIRECTION_DOWN:
                to = [randomRange(-w, w), randomRange(-w, d)];
                break;
            default:
                to = [randomRange(-d, d), randomRange(-d, d)];
        }

        pixel = new xss.PixelCollection().add(location[0], location[1]);
        duration = Math.pow(randomRange(1, 10), 3);

        shape = new xss.Shape(pixel);
        shape.animate({to: to, duration: duration}).lifetime(0, duration);
        xss.shapes[NS_EXPLOSION + randomStr(3)] = shape;
    }
}

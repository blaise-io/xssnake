import { GAME, CANVAS, LEVEL } from "../../shared/const";
import { _ } from "../../shared/util";
import { STORAGE, UC } from "../const";
import { State } from "../state";
import { Dialog, DialogType } from "../ui/dialog";
import { font, fontHeight, fontWidth } from "../ui/font";
import { flash, lifetime } from "../ui/shapeClient";
import { clearHash } from "./url";

export function instruct(str: string, start = 0, duration = 2, flashInstruct = false): void {
    const x = CANVAS.WIDTH - fontWidth(str) - 2;
    const y = CANVAS.HEIGHT - fontHeight(str) - 2;

    const shape = font(str, x, y, { invert: true });
    shape.flags.isOverlay = true;
    lifetime(shape, start, duration * 1000);

    if (flashInstruct) {
        flash(shape);
    }

    State.shapes.INSTRUCTION = shape;
}

export function stylizeUpper(str: string): string {
    return str.toUpperCase().replace(/I/, "i");
}

export function error(str: string, callback?: CallableFunction): void {
    clearHash();

    const exit = function () {
        dialog.destruct();
        if (callback) {
            callback();
        }
        State.flow.restart();
    };

    const body = _(`Press ${UC.ENTER_KEY} to continue`);
    const dialog = new Dialog(str, body, {
        type: DialogType.ALERT,
        ok: exit,
    });
}

export const storage = {
    get: (key: STORAGE): unknown => {
        try {
            return JSON.parse(localStorage.getItem(key) as string);
        } catch (err) {
            localStorage.removeItem(key);
        }
        return "";
    },
    set: (key: STORAGE, value: unknown): unknown => {
        if (value === null) {
            localStorage.removeItem(key);
            return "";
        } else {
            return localStorage.setItem(key, JSON.stringify(value));
        }
    },
};

export function isMac(): boolean {
    return /Macintosh/.test(navigator.appVersion);
}

/* @deprecated use template string */
export function format(str: string, ...data: (string | number)[]): string {
    return str.replace(/{(\d+)}/g, (match, number) => {
        return String(data[number]);
    });
}

export function translateGame(coordinate: Coordinate): Coordinate {
    coordinate[0] = translateGameX(coordinate[0]);
    coordinate[1] = translateGameY(coordinate[1]);
    return coordinate;
}

export function translateGameX(x: number): number {
    return x * GAME.TILE + GAME.LEFT;
}

export function translateGameY(y: number): number {
    return y * GAME.TILE + GAME.TOP;
}

export function debounce(fn: CallableFunction, delay = 100): (...args: unknown[]) => void {
    let timeout: number;
    return (...args) => {
        if (timeout) {
            window.clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
            clearTimeout(timeout);
            fn(...args);
        }, delay);
    };
}

export async function clientImageLoader(base64Image: string): Promise<ImageData> {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = LEVEL.WIDTH;
        canvas.height = LEVEL.HEIGHT;

        const context = canvas.getContext("2d") as CanvasRenderingContext2D;

        const image = new Image();
        image.onload = function () {
            context.drawImage(image, 0, 0);
            resolve(context.getImageData(0, 0, LEVEL.WIDTH, LEVEL.HEIGHT));
        };
        image.src = base64Image;
    });
}

import { GAME_LEFT, GAME_TILE, GAME_TOP, HEIGHT, LEVEL, WIDTH } from "../../shared/const";
import { UC_ENTER_KEY } from "../const";
import { ClientState } from "../state/clientState";
import { Dialog } from "../ui/dialog";
import { font, fontHeight, fontWidth } from "../ui/font";
import { flash, lifetime } from "../ui/shapeClient";

export function instruct(str: string, duration = 2000, flashInstruct = false): void {
    const x = WIDTH - fontWidth(str) - 2;
    const y = HEIGHT - fontHeight(str) - 2;

    const shape = font(str, x, y, { invert: true });
    shape.flags.isOverlay = true;
    lifetime(shape, 0, duration);

    if (flashInstruct) {
        flash(shape);
    }

    ClientState.shapes.INSTRUCTION = shape;
}

export function error(str: string, callback?: CallableFunction): void {
    urlHash();

    const exit = function () {
        dialog.destruct();
        if (callback) {
            callback();
        }
        ClientState.flow.restart();
    };

    const body = "Press " + UC_ENTER_KEY + " to continue";
    const dialog = new Dialog(str, body, {
        type: Dialog.TYPE.ALERT,
        ok: exit,
    });
}

export function storage(key?: string, value?: unknown): unknown {
    if (arguments.length === 1) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (err) {
            localStorage.removeItem(key);
        }
        return "";
    } else if (arguments.length === 2) {
        if (value === null) {
            localStorage.removeItem(key);
            return "";
        } else {
            return localStorage.setItem(key, JSON.stringify(value));
        }
    }
}

export function isMac(): boolean {
    return /Macintosh/.test(navigator.appVersion);
}

export function urlHash(key = "", value = ""): string {
    let newhash = "";
    const dict = {};

    const hash = location.hash.substr(1);
    const arr = hash.split(/[:;]/g);

    // Populate dict
    for (let i = 0, m = arr.length; i < m; i += 2) {
        dict[arr[i]] = arr[i + 1];
    }

    switch (arguments.length) {
        case 0: // Empty
            if (location.hash) {
                history.replaceState(null, "", location.pathname + location.search);
            }
            return;
        case 1: // Return value
            return dict[key] || "";
        case 2: // Set value
            dict[key] = value;
            for (const k in dict) {
                if (k && dict[k]) {
                    newhash += k + ":" + dict[k] + ";";
                }
            }
            location.replace("#" + newhash.replace(/;$/, ""));
            return value;
    }
}

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
    return x * GAME_TILE + GAME_LEFT;
}

export function translateGameY(y: number): number {
    return y * GAME_TILE + GAME_TOP;
}

export function debounce(fn: CallableFunction, delay = 100): (...args) => void {
    let timeout;
    return (...args) => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            timeout = null;
            fn(...args);
        }, delay);
    };
}

export async function clientImageLoader(base64Image: string): Promise<ImageData> {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = LEVEL.WIDTH;
        canvas.height = LEVEL.HEIGHT;

        const context = canvas.getContext("2d");

        const image = new Image();
        image.onload = function () {
            context.drawImage(image, 0, 0);
            resolve(context.getImageData(0, 0, LEVEL.WIDTH, LEVEL.HEIGHT));
        };
        image.src = base64Image;
    });
}

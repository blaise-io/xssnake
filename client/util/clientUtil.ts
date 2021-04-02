import { GAME_TILE, HEIGHT, WIDTH } from "../../shared/const";
import { GAME_LEFT, GAME_TOP, UC_ENTER_KEY } from "../const";
import { State } from "../state/state";
import { Dialog } from "../ui/dialog";
import { font, fontHeight, fontWidth } from "../ui/font";

/**
 * @param {string} str
 * @param {number=} duration
 * @param {boolean=} flash
 */
export function instruct(str, duration=2000, flash=false) {
    const x = WIDTH - fontWidth(str) - 2;
    const y = HEIGHT - fontHeight(str) - 2;

    const shape = font(str, x, y, {invert: true});
    shape.isOverlay = true;
    shape.lifetime(0, duration);

    if (flash) {
        shape.flash();
    }

    State.shapes.INSTRUCTION = shape;
}

/**
 * @param {string} str
 * @param {Function=} callback
 */
export function error(str, callback?) {
    urlHash();

    const exit = function() {
        dialog.destruct();
        if (callback) {
            callback();
        }
        State.flow.restart();
    };

    const body = 'Press ' + UC_ENTER_KEY + ' to continue';
    const dialog = new Dialog(str, body, {
        type: Dialog.TYPE.ALERT,
        ok  : exit
    });
}

/**
 * Simple wrapper for localStorage
 * @param {string=} key
 * @param {*=} value
 * @return {?}
 */
export function storage(key, value?) {
    if (arguments.length === 1) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (err) {
            localStorage.removeItem(key);
        }
        return '';
    } else if (arguments.length === 2) {
        if (value === null) {
            localStorage.removeItem(key);
            return '';
        } else {
            return localStorage.setItem(key, JSON.stringify(value));
        }
    }
}

/**
 * @return {boolean}
 */
export function isMac() {
    return (/Macintosh/).test(navigator.appVersion);
}

/**
 * Simple wrapper for location.hash
 * @param {string=} key
 * @param {*=} value
 * @return {?}
 */
export function urlHash(key="", value="") {
    let hash, arr, newhash = '', dict = {};

    hash = location.hash.substr(1);
    arr = hash.split(/[:;]/g);

    // Populate dict
    for (let i = 0, m = arr.length; i < m; i += 2) {
        dict[arr[i]] = arr[i + 1];
    }

    switch (arguments.length) {
        case 0: // Empty
            if (location.hash) {
                history.replaceState(null, '', location.pathname + location.search);
            }
            return;
        case 1: // Return value
            return dict[key] || '';
        case 2: // Set value
            dict[key] = value;
            for (const k in dict) {
                if (dict.hasOwnProperty(k)) {
                    if (k && dict[k]) {
                        newhash += k + ':' + dict[k] + ';';
                    }
                }
            }
            location.replace('#' + newhash.replace(/;$/, ''));
            return value;
    }
}


/**
 * @param {number} num
 * @param {string=} single
 * @param {string=} plural
 * @return {string}
 */
export function pluralize(num, single, plural) {
    return (num === 1) ? (single || '') : (plural || 's');
}

/**
 * @param {string} str
 * @param {...(string|number)} varArgs
 * @return {string}
 */
export function format(str, varArgs) {
    const args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/\{(\d+)\}/g, function(match, number) {
        return args[number];
    });
}

/**
 * @param {Coordinate} coordinate
 * @return {Coordinate}
 */
export function translateGame(coordinate) {
    coordinate[0] = translateGameX(coordinate[0]);
    coordinate[1] = translateGameY(coordinate[1]);
    return coordinate;
}

/**
 * @param {number} x
 * @return {number}
 */
function translateGameX(x) {
    return (x * GAME_TILE) + GAME_LEFT;
}

/**
 * @param {number} y
 * @return {number}
 */
function translateGameY(y) {
    return (y * GAME_TILE) + GAME_TOP;
}

/**
 * @param {Function} fn
 * @param {number=} delay
 * @return {Function}
 */
export function debounce(fn, delay=100) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            fn.apply(context, args);
        }, 100);
    };
}

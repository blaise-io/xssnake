'use strict';

import { GAME_TILE, HEIGHT, WIDTH } from "../../shared/const";
import { GAME_LEFT, GAME_TOP } from "../const";

const xss: any = {}

/**
 * @param {string} str
 * @param {number=} duration
 * @param {boolean=} flash
 */
function instruct(str, duration, flash) {
    var shape, x, y;

    x = WIDTH - xss.font.width(str) - 2;
    y = HEIGHT - xss.font.height(str) - 2;

    shape = xss.font.shape(str, x, y, {invert: true});
    shape.isOverlay = true;
    shape.lifetime(0, duration);

    if (flash) {
        shape.flash();
    }

    xss.shapes.INSTRUCTION = shape;
}

/**
 * @param {string} str
 * @param {Function=} callback
 */
function error(str, callback) {
    var exit, dialog, body;

    hash();

    exit = function() {
        dialog.destruct();
        if (callback) {
            callback();
        }
        xss.flow.restart();
    };

    body = 'Press ' + xss.UC_ENTER_KEY + ' to continue';
    dialog = new xss.Dialog(str, body, {
        type: xss.Dialog.TYPE.ALERT,
        ok  : exit
    });
};

/**
 * Simple wrapper for localStorage
 * @param {string=} key
 * @param {*=} value
 * @return {?}
 */
function storage(key, value) {
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
};

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
export function hash(key="", value="") {
    var hash, arr, newhash = '', dict = {};

    hash = location.hash.substr(1);
    arr = hash.split(/[:;]/g);

    // Populate dict
    for (var i = 0, m = arr.length; i < m; i += 2) {
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
            for (var k in dict) {
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
function pluralize(num, single, plural) {
    return (num === 1) ? (single || '') : (plural || 's');
};

/**
 * @param {string} str
 * @param {...(string|number)} varArgs
 * @return {string}
 */
function format(str, varArgs) {
    var args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/\{(\d+)\}/g, function(match, number) {
        return args[number];
    });
};

/**
 * @param {xss.Coordinate} coordinate
 * @return {xss.Coordinate}
 */
function translateGame(coordinate) {
    coordinate[0] = translateGameX(coordinate[0]);
    coordinate[1] = translateGameY(coordinate[1]);
    return coordinate;
};

/**
 * @param {number} x
 * @return {number}
 */
function translateGameX(x) {
    return (x * GAME_TILE) + GAME_LEFT;
};

/**
 * @param {number} y
 * @return {number}
 */
function translateGameY(y) {
    return (y * GAME_TILE) + GAME_TOP;
};

/**
 * @param {Function} fn
 * @param {number=} delay
 * @return {Function}
 */
function debounce(fn, delay) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            fn.apply(context, args);
        }, delay || 100);
    };
};


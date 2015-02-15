'use strict';

/**
 * @param {string} str
 * @param {number=} duration
 * @param {boolean=} flash
 */
xss.util.instruct = function(str, duration, flash) {
    var shape, x, y;

    x = xss.WIDTH - xss.font.width(str) - 2;
    y = xss.HEIGHT - xss.font.height(str) - 2;

    shape = xss.font.shape(str, x, y, {invert: true});
    shape.isOverlay = true;
    shape.lifetime(0, duration);

    if (flash) {
        shape.flash();
    }

    xss.shapes.INSTRUCTION = shape;
};

/**
 * @param {string} str
 * @param {Function=} callback
 */
xss.util.error = function(str, callback) {
    var exit, dialog, body;

    xss.util.hash();

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
xss.util.storage = function(key, value) {
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
xss.util.isMac = function() {
    return (/Macintosh/).test(navigator.appVersion);
};

/**
 * Simple wrapper for location.hash
 * @param {string=} key
 * @param {*=} value
 * @return {?}
 */
xss.util.hash = function(key, value) {
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
};

/**
 * @param {number} num
 * @param {string=} single
 * @param {string=} plural
 * @return {string}
 */
xss.util.pluralize = function(num, single, plural) {
    return (num === 1) ? (single || '') : (plural || 's');
};

/**
 * @param {string} str
 * @param {...(string|number)} varArgs
 * @return {string}
 */
xss.util.format = function(str, varArgs) {
    var args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/\{(\d+)\}/g, function(match, number) {
        return args[number];
    });
};

/**
 * @param {xss.Coordinate} coordinate
 * @return {xss.Coordinate}
 */
xss.util.translateGame = function(coordinate) {
    coordinate[0] = xss.util.translateGameX(coordinate[0]);
    coordinate[1] = xss.util.translateGameY(coordinate[1]);
    return coordinate;
};

/**
 * @param {number} x
 * @return {number}
 */
xss.util.translateGameX = function(x) {
    return (x * xss.GAME_TILE) + xss.GAME_LEFT;
};

/**
 * @param {number} y
 * @return {number}
 */
xss.util.translateGameY = function(y) {
    return (y * xss.GAME_TILE) + xss.GAME_TOP;
};

/**
 * @param {Function} fn
 * @param {number=} delay
 * @return {Function}
 */
xss.util.debounce = function(fn, delay) {
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

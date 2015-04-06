'use strict';


/**
 * Dummy callback function.
 * @example this.callback = optionalCallbackParam || xss.util.noop;
 * @param {...*} varArgs
 * @return {void}
 */
xss.util.noop = function(varArgs) {};

/**
 * @param {Object} obj Object to clone.
 * @return {?} Clone of the input object.
 */
xss.util.clone = function(obj) {
    var res = {};
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            res[k] = obj[k];
        }
    }
    return res;
};

/**
 * @param {Object} target
 * @param {...Object} varArgs
 */
xss.util.extend = function(target, varArgs) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                target[k] = source[k];
            }
        }
    }
};

/**
 * @param {Array} haystack
 * @param {*} needle
 * @return {Array}
 */
xss.util.filter = function(haystack, needle) {
    var filtered = [];
    for (var i = 0, m = haystack.length; i < m; i++) {
        if (xss.util.compareProperties(haystack[i], needle)) {
            filtered.push(haystack[i]);
        }
    }
    return filtered;
};

/**
 * @param {*} completeObject
 * @param {*} subsetObject
 * @return {boolean}
 */
xss.util.compareProperties = function(completeObject, subsetObject) {
    if (completeObject === subsetObject) {
        return true;
    } else if (subsetObject instanceof Object) {
        var keys = Object.keys(subsetObject);
        for (var i = 0, l = keys.length; i < l; i++) {
            if (!xss.util.compareProperties(
                completeObject[keys[i]],
                subsetObject[keys[i]])
            ) {
                return false;
            }
        }
        return true;
    }
    return false;
};

/**
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
xss.util.randomRange = function(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

/**
 * @param {Array} arr
 * @return {?}
 */
xss.util.randomArrItem = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * @param {Array} arr
 * @return {number}
 */
xss.util.randomArrIndex = function(arr) {
    return Math.floor(Math.random() * arr.length);
};

/**
 * @param {number=} len
 * @return {string}
 */
xss.util.randomStr = function(len) {
    return Math.random().toString(36).substr(2, len || 3);
};

/**
 * Ensure an array index is within bounds.
 * @param {number} index
 * @param {Array} arr
 * @return {number}
 */
xss.util.ensureIndexWithinBounds = function(index, arr) {
    var len = arr.length;
    if (index >= len) {
        return 0;
    } else if (index < 0) {
        return len - 1;
    }
    return index;
};

/**
 * @param {Array.<number>} numbers
 * @return {number}
 */
xss.util.average = function(numbers) {
    var total = 0;
    for (var i = 0, m = numbers.length; i < m; i++) {
        total += numbers[i];
    }
    return m ? total / m : 0;
};

/**
 * @param {xss.Coordinate} a
 * @param {xss.Coordinate} b
 * @return {number}
 */
xss.util.delta = function(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
};

/**
 * @param {xss.Coordinate} a
 * @param {xss.Coordinate} b
 * @return {boolean}
 */
xss.util.eq = function(a, b) {
    return a[0] === b[0] && a[1] === b[1];
};

/**
 * @param {*} obj
 * @param {*} val
 * @return {?string}
 */
xss.util.getKey = function(obj, val) {
    for (var k in obj) {
        if (obj.hasOwnProperty(k) && val === obj[k]) {
            return k;
        }
    }
    return null;
};

/**
 * Faster sorting function.
 * http://jsperf.com/javascript-sort/
 *
 * @param {Array.<number>} arr
 * @return {Array.<number>}
 */
xss.util.sort = function(arr) {
    for (var i = 1; i < arr.length; i++) {
        var tmp = arr[i], index = i;
        while (arr[index - 1] > tmp) {
            arr[index] = arr[index - 1];
            --index;
        }
        arr[index] = tmp;
    }
    return arr;
};

/**
 * @param {number} iterations
 * @param {Function} fn
 * @param {string|number=} label
 */
xss.util.benchmark = function(iterations, fn, label) {
    var duration, i = iterations, start = +new Date();
    while (i--) {
        fn();
    }
    duration = +new Date() - start;
    console.log(label || 'Benchmark', {
        x: iterations,
        avg: duration / iterations,
        total: duration
    });
};

/**
 * @return {string}
 */
xss.util.getRandomName = function() {
    var name = xss.util.randomArrItem([
        'Ant', 'Bat', 'Bear', 'Bird', 'Cat', 'Cow', 'Crab', 'Croc', 'Deer',
        'Dodo', 'Dog', 'Duck', 'Emu', 'Fish', 'Fly', 'Fox', 'Frog', 'Goat',
        'Hare', 'Ibis', 'Kiwi', 'Lion', 'Lynx', 'Miao', 'Mole', 'Moth', 'Mule',
        'Oger', 'Pig', 'Pika', 'Poke', 'Puma', 'Puss', 'Rat', 'Seal', 'Swan',
        'Wasp', 'Wolf', 'Yak', 'Zeb']);
    return name + '.' + xss.util.randomRange(10, 99);
};

/**
 * @param {Object} obj Object to clone.
 * @return {?} Clone of the input object.
 */
export function clone(obj) {
    const res = {}
    for (const k in obj) {
        if (obj.hasOwnProperty(k)) {
            res[k] = obj[k];
        }
    }
    return res;
}

/**
 * @param {Object} target
 * @param {...Object} varArgs
 */
export function extend(target, varArgs) {
    for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        for (const k in source) {
            if (source.hasOwnProperty(k)) {
                target[k] = source[k];
            }
        }
    }
}

/**
 * @param {Array} haystack
 * @param {*} needle
 * @return {Array}
 */
export function filter(haystack, needle) {
    const filtered = [];
    for (let i = 0, m = haystack.length; i < m; i++) {
        if (compareProperties(haystack[i], needle)) {
            filtered.push(haystack[i]);
        }
    }
    return filtered;
}

/**
 * @param {*} completeObject
 * @param {*} subsetObject
 * @return {boolean}
 */
export function compareProperties(completeObject, subsetObject) {
    if (completeObject === subsetObject) {
        return true;
    } else if (subsetObject instanceof Object) {
        const keys = Object.keys(subsetObject);
        for (let i = 0, l = keys.length; i < l; i++) {
            if (!compareProperties(
                completeObject[keys[i]],
                subsetObject[keys[i]])
            ) {
                return false;
            }
        }
        return true;
    }
    return false;
}

/**
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export function randomRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * @param {Array} arr
 * @return {?}
 */
export function randomArrItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @param {Array} arr
 * @return {number}
 */
export function randomArrIndex(arr) {
    return Math.floor(Math.random() * arr.length);
}

/**
 * @param {number=} len
 * @return {string}
 */
export function randomStr(len=3) {
    return Math.random().toString(36).substr(2, len);
}

/**
 * Ensure an array index is within bounds.
 * @param {number} index
 * @param {Array} arr
 * @return {number}
 */
export function ensureIndexWithinBounds(index, arr) {
    const len = arr.length;
    if (index >= len) {
        return 0;
    } else if (index < 0) {
        return len - 1;
    }
    return index;
}

/**
 * @param {Array.<number>} numbers
 * @return {number}
 */
export function average(numbers) {
    let total = 0;
    for (var i = 0, m = numbers.length; i < m; i++) {
        total += numbers[i];
    }
    return m ? total / m : 0;
}

/**
 * @param {Coordinate} a
 * @param {Coordinate} b
 * @return {number}
 */
export function delta(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

/**
 * @param {Coordinate} a
 * @param {Coordinate} b
 * @return {boolean}
 */
export function eq(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

/**
 * @param {*} obj
 * @param {*} val
 * @return {?string}
 */
export function getKey(obj, val) {
    for (const k in obj) {
        if (obj.hasOwnProperty(k) && val === obj[k]) {
            return k;
        }
    }
    return null;
}

/**
 * Faster sorting function.
 * http://jsperf.com/javascript-sort/
 *
 * @param {Array.<number>} arr
 * @return {Array.<number>}
 */
export function sort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let tmp = arr[i], index = i;
        while (arr[index - 1] > tmp) {
            arr[index] = arr[index - 1];
            --index;
        }
        arr[index] = tmp;
    }
    return arr;
}

/**
 * @param {number} iterations
 * @param {Function} fn
 * @param {string|number=} label
 */
export function benchmark(iterations, fn, label="") {
    let duration, i = iterations, start = +new Date();
    while (i--) {
        fn();
    }
    duration = +new Date() - start;
    console.log(label || 'Benchmark', {
        x: iterations,
        avg: duration / iterations,
        total: duration
    });
}

/**
 * @return {string}
 */
export function getRandomName() {
    const name = randomArrItem([
        'Ant', 'Bat', 'Bear', 'Bird', 'Cat', 'Cow', 'Crab', 'Croc', 'Deer',
        'Dodo', 'Dog', 'Duck', 'Emu', 'Fish', 'Fly', 'Fox', 'Frog', 'Goat',
        'Hare', 'Ibis', 'Kiwi', 'Lion', 'Lynx', 'Miao', 'Mole', 'Moth', 'Mule',
        'Oger', 'Pig', 'Pika', 'Poke', 'Puma', 'Puss', 'Rat', 'Seal', 'Swan',
        'Wasp', 'Wolf', 'Yak', 'Zeb']);
    return name + '.' + randomRange(10, 99);
}

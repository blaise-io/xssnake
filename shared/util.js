'use strict';

xss.util = {

    /**
     * Dummy callback function to reduce if statements.
     * @example this.callback = optionalCallbackParam || xss.util.noop;
     * @param varArgs {...?}
     */
    noop: function(varArgs) {},

    /**
     * @param {Object} obj Object to clone.
     * @return {?} Clone of the input object.
     */
    clone: function(obj) {
        var res = {};
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                res[k] = obj[k];
            }
        }
        return res;
    },

    /**
     * @param {Object} target
     * @param {...Object} varArgs
     */
    extend: function(target, varArgs) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var k in source) {
                if (source.hasOwnProperty(k)) {
                    target[k] = source[k];
                }
            }
        }
    },

    /**
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    randomRange: function(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    },

    /**
     * @param {Array} arr
     * @return {*}
     */
    randomItem: function(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * @param {number=} len
     * @return {string}
     */
    randomStr: function(len) {
        return Math.random().toString(36).substr(2, len || 3);
    },

    /**
     * Ensure an array index is within bounds.
     * @param {number} index
     * @param {Array} arr
     * @return {number}
     */
    ensureIndexWithinBounds: function(index, arr) {
        var len = arr.length;
        if (index >= len) {
            return 0;
        } else if (index < 0) {
            return len - 1;
        }
        return index;
    },

    /**
     * @param {Array.<number>} numbers
     * @returns {number}
     */
    average: function(numbers) {
        var total = 0;
        for (var i = 0, m = numbers.length; i < m; i++) {
            if (typeof numbers[i] === 'number') {
                total += numbers[i];
            }
        }
        return m ? total / m : 0;
    },

    /**
     * @param {Array.<number>} a
     * @param {Array.<number>} b
     * @return {number}
     */
    delta: function(a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    },

    /**
     * @param {Array.<number>} a
     * @param {Array.<number>} b
     * @return {boolean}
     */
    eq: function(a, b) {
        return a[0] === b[0] && a[1] === b[1];
    },

    /**
     * @param {*} obj
     * @param {*} val
     * @return {?string}
     */
    getKey: function(obj, val) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k) && val === obj[k]) {
                return k;
            }
        }
        return null;
    },

    /**
     * Faster sorting function.
     * http://jsperf.com/javascript-sort/
     *
     * @param {Array.<number>} arr
     * @returns {Array.<number>}
     */
    sort: function(arr) {
        for (var i = 1; i < arr.length; i++) {
            var tmp = arr[i], index = i;
            while (arr[index - 1] > tmp) {
                arr[index] = arr[index - 1];
                --index;
            }
            arr[index] = tmp;
        }
        return arr;
    },

    /**
     * @param {number} iterations
     * @param {Function} fn
     * @param {string|number=} label
     */
    benchmark: function(iterations, fn, label) {
        var duration, i = iterations, start = +new Date();
        while (i--) { fn(); }
        duration = +new Date() - start;
        console.log(label || 'Benchmark', duration, duration / iterations);
    }

};

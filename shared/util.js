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
     * Normalize an array index.
     * @param {number} index
     * @param {Array} arr
     * @return {number}
     */
    normArrIndex: function(index, arr) {
        var len = arr.length;
        if (index >= len) {
            return 0;
        } else if (index < 0) {
            return len - 1;
        }
        return index;
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
    }

};

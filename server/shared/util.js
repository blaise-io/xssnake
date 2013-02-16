/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals XSS*/
'use strict';

module.exports = {

    /**
     * @param {*} destination
     * @param {*} source
     * @return {*}
     */
    extend: function(destination, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination;
    },

    /**
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    randomBetween: function(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    },

    /**
     * @param {Array} arr
     * @return {*}
     */
    randomItem: function(arr) {
        return arr[Math.floor(Math.random() * (arr.length - 1))];
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
    },

    hash: function(key, val) {
        var hash, arr, newhash = '', dict = {};

        hash = location.hash.substr(1);
        arr = hash.split(/[:;]/g);

        // Populate dict
        for (var i = 0, m = arr.length; i < m; i += 2) {
            dict[arr[i]] = arr[i + 1]
        }

        switch (arguments.length) {
            case 0: // Empty
                if (location.hash) {
                    try {
                        history.pushState(null, '', location.pathname + location.search);
                    } catch(err) {
                        document.hash = '';
                    }
                }
                break;
            case 1: // Return value
                return dict[key];
                break;
            case 2: // Set value
                dict[key] = val;
                for (var k in dict) {
                    if (dict.hasOwnProperty(k)) {
                        if (k && dict[k]) {
                            newhash += k + ':' + dict[k] + ';'
                        }
                    }
                }
                location.replace('#' + newhash.replace(/;$/, ''));
                return val;
        }
        return null;
    }

};

if (typeof XSS !== 'undefined') {
    XSS.util = module.exports;
}
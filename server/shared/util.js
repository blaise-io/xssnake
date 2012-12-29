/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var Util = module.exports = {

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
        return arr[Util.randomBetween(0, arr.length - 1)];
    },

    /**
     * @return {string}
     */
    randomStr: function() {
        return Math.random().toString(36).substring(2, 5);
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
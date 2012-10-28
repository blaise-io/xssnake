/*jshint globalstrict:true */
/*globals XSS*/

'use strict';

var Utils = {

    extend: function(destination, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination;
    },

    /**
     * @param {string} url
     * @param {Function} callback
     */
    loadScript: function(url, callback) {
        var script, head;
        script = document.createElement('script');
        script.async = 'async';
        script.src = url;
        script.onload = callback;
        script.onerror = function() {
            XSS.shapes = {
                err: XSS.font.shape(0, 70, 'Cannot connect to ' + url)
            };
        };
        head = document.querySelector('head');
        head.insertBefore(script, head.firstChild);
    },

    addListener: {
        /**
         * @param {Function} listener
         * @return {*}
         */
        keydown: function(listener) {
            return XSS.doc.addEventListener('keydown', listener, false);
        },

        /**
         * @param {Function} listener
         * @return {*}
         */
        keyup: function(listener) {
            return XSS.doc.addEventListener('keyup', listener, false);
        }
    },

    removeListener: {
        /**
         * @param {Function} listener
         * @return {*}
         */
        keydown: function(listener) {
            return XSS.doc.removeEventListener('keydown', listener, false);
        },

        /**
         * @param {Function} listener
         * @return {*}
         */
        keyup: function(listener) {
            return XSS.doc.removeEventListener('keyup', listener, false);
        }
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
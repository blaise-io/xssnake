/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS*/
'use strict';

/**
 * Client XSS.util extension
 */
XSS.util.extend(XSS.util, {

    /**
     * @param {string} url
     * @param {Function} callback
     */
    loadScript: function(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        script.onerror = function() {
            XSS.util.instruct('Error loading ' + url);
        };
        document.querySelector('head').appendChild(script);
    },

    /**
     * @param {string} str
     * @param {number=} duration
     */
    instruct: function(str, duration) {
        var shape = XSS.font.shape(
                str, XSS.PIXELS_H - XSS.font.width(str) - 3, XSS.PIXELS_V - 10
            );
        shape.clearBBox = true;
        if (duration) {
            shape.lifetime(0, duration);
        }
        XSS.shapes.instruction = shape;
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
     * Simple wrapper for localStorage
     * @param {string} key
     * @param {*?} value
     * @return {*}
     */
    storage: function(key, value) {
        if (!key || !localStorage) {
            return '';
        } else if (value === null) {
            localStorage.removeItem(key);
            return '';
        } else if (typeof value !== 'undefined') {
            return localStorage.setItem(key, value);
        } else {
            return localStorage.getItem(key);
        }
    }

});
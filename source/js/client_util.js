/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Util*/
'use strict';

/**
 * Client Util extension
 * @lends {Util}
 */
Util.extend(Util, {

    /**
     * @param {string} url
     * @param {Function} callback
     */
    loadScript: function(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        script.onerror = function() {
            var err = 'Error loading ' + url;
            XSS.shapes.instruction = XSS.font.shape(
                err, XSS.PIXELS_H - XSS.font.width(err + ' '), XSS.PIXELS_V - 10
            );
        };
        document.querySelector('head').appendChild(script);
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
        } else if (value) {
            return localStorage.setItem(key, value);
        } else {
            return localStorage.getItem(key) || '';
        }
    }

});
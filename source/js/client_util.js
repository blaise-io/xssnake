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
     * @param {boolean=} flash
     */
    instruct: function(str, duration, flash) {
        var shape = XSS.font.shape(
                str, XSS.PIXELS_H - XSS.font.width(str) - 3, XSS.PIXELS_V - 10
            );
        shape.clearBBox = true;
        if (duration) {
            shape.lifetime(0, duration);
        }
        if (flash) {
            shape.flash(500, 250);
        }
        XSS.shapes.instruction = shape;
    },

    /**
     * @param {string} str
     */
    error: function(str) {
        var left, exit;

        left = XSS.MENU_LEFT + ((XSS.MENU_WIDTH - XSS.font.width(str)) / 2);
        exit = function() {
            XSS.off.keydown(exit);
            XSS.stageflow = new StageFlow();
        };

        XSS.util.hash();

        XSS.shapes = {
            error: XSS.font.shape(str, left, 60)
        };

        XSS.on.keydown(exit);
        window.setTimeout(exit, 6000);
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
        if (!localStorage) {
            return '';
        }
        switch (arguments.length) {
            case 0: return '';
            case 1: return localStorage.getItem(key);
            case 2:
                if (value === null) {
                    localStorage.removeItem(key);
                    return '';
                } else {
                    return localStorage.setItem(key, value);
                }
        }
    },

    /**
     * Simple wrapper for location.hash
     * @param {string?} key
     * @param {*?} value
     * @return {*}
     */
    hash: function(key, value) {
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
                    try {
                        history.replaceState(null, '', location.pathname + location.search);
                    } catch(err) {
                        document.hash = '';
                    }
                }
                return;
            case 1: // Return value
                return dict[key];
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
    }

});
/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Dialog, StageFlow*/
'use strict';

/**
 * Client XSS.util extension
 */
XSS.util.extend(XSS.util, {

    /**
     * @param {string} str
     * @param {number=} duration
     * @param {boolean=} flash
     */
    instruct: function(str, duration, flash) {
        var shape, left = XSS.WIDTH - XSS.font.width(str) - 3;

        shape = XSS.font.shape(
            str, left, XSS.HEIGHT - 3 - XSS.font.height(str), {invert: true}
        );
        shape.clearBBox = true;

        if (duration) {
            shape.lifetime(0, duration);
        }

        if (flash) {
            shape.flash();
        }

        XSS.shapes.instruction = shape;
    },

    /**
     * @param {string} str
     * @param {Function=} callback
     */
    error: function(str, callback) {
        var exit, dialog;

        XSS.util.hash();

        exit = function() {
            dialog.destruct();

            XSS.flow.destruct();
            XSS.socket.destruct();

            if (callback) {
                callback();
            }

            XSS.flow = new StageFlow();
        };

        dialog = new Dialog(str, 'Press ' + XSS.UC_ENTER_KEY + ' to continue', {
            type: Dialog.TYPE.ALERT,
            ok  : exit
        });
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
        if (!localStorage || key === null) {
            return '';
        }
        switch (arguments.length) {
            case 0:
                return '';
            case 1:
                try {
                    return JSON.parse(localStorage.getItem(key));
                } catch(err) {
                    localStorage.removeItem(key);
                }
                return '';
            case 2:
                if (value === null) {
                    localStorage.removeItem(key);
                    return '';
                } else {
                    return localStorage.setItem(key, JSON.stringify(value));
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

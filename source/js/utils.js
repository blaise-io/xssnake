/*jshint globalstrict:true */
/*globals XSS*/

'use strict';

var Utils = {

    /**
     * @param {string} url
     * @param {function()} callback
     */
    loadScript: function(url, callback) {
        var script, head;
        script = document.createElement('script');
        script.async = 'async';
        script.src = url;
        script.onload = callback;
        script.onerror = function() {
            throw new Error(url);
        };
        head = document.querySelector('head');
        head.insertBefore(script, head.firstChild);
    },

    addListener: {
        keydown: function(listener) {
            return XSS.doc.addEventListener('keydown', listener, false);
        },
        keyup  : function(listener) {
            return XSS.doc.addEventListener('keyup', listener, false);
        }
    },

    removeListener: {
        keydown: function(listener) {
            return XSS.doc.removeEventListener('keydown', listener, false);
        },
        keyup  : function(listener) {
            return XSS.doc.removeEventListener('keyup', listener, false);
        }
    }

};
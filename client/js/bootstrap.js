/*jshint sub:true */
/*globals XSS*/

/**
 * Bootstrap
 * Detect support, init global listeners
 *
 * @return {Object}
 * @constructor
 */
XSS.Bootstrap = function() {
    'use strict';

    var init = function() {
            detectSupport();
            initKeyTriggers();
        },

        input = $('<input>').appendTo(document.body).attr('autofocus', 1),

        detectSupport = function() {
            if (!detectCanvas()) {
                $(document.body).text('Your browser does not support canvas.');
                return false;
            } else if (!getWebSocket()) {
                $(document.body).text('Your browser does not support websockets.');
                return false;
            }
        },

        initKeyTriggers = function() {
            XSS.doc.on('keydown', function(e) {
                switch (e.which) {
                    case  8: XSS.doc.trigger('/xss/key/backspace'); break;
                    case 13: XSS.doc.trigger('/xss/key/enter'); break;
                    case 27: XSS.doc.trigger('/xss/key/escape'); break;
                    case 37: XSS.doc.trigger('/xss/key/left'); break;
                    case 38: XSS.doc.trigger('/xss/key/up'); break;
                    case 39: XSS.doc.trigger('/xss/key/right'); break;
                    case 40: XSS.doc.trigger('/xss/key/down'); break;
                }
            });
        },

        detectCanvas = function() {
            return window['CanvasRenderingContext2D'];
        },

        getWebSocket = function() {
            return window['WebSocket'] || window['MozWebSocket'];
        };

    init();

    return {
        input: input
    };
};
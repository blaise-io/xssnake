var XSS = {};

// Document Ready
$(function() {
    'use strict';

    $.extend(XSS, new XSS.Core());

    XSS.canvas    = new XSS.Canvas();
    XSS.socket    = new XSS.WebSocket();
    XSS.font      = new XSS.Font();
    XSS.drawables = new XSS.Drawables();
    XSS.effects   = new XSS.Effects();
    XSS.menu      = new XSS.Menu();

});


XSS.Core = function() {
    'use strict';

    var doc = $(document),

        settings = {
            width : 256, // Tiles wide
            height: 160, // Tiles high
            s     : 4    // Tile size
        },

        init = function() {
            detectSupport();
            initKeyTriggers();
        },

        input = $('<input>').appendTo(document.body).attr({autofocus: true}),

        detectSupport = function() {
            if (!detectCanvas()) {
                $(document.body).text('Your browser does not support canvas.');
                return false;
            } else if (!getWebSocket()) {
                $(document.body).text('Your browser does not support websockets.');
                return false;
            }

            if (!window.requestAnimationFrame) {
                setRequestAnimationFrame();
            }
        },

        initKeyTriggers = function() {
            doc.on('keydown', function(e) {
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
            return window.CanvasRenderingContext2D;
        },

        getWebSocket = function() {
            return window.WebSocket || window.MozWebSocket;
        },

        setRequestAnimationFrame = function() {
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (var i = 0, m = vendors.length; i < m && !window.requestAnimationFrame; i++) {
                window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            }
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
            }
        };

    init();

    return {
        doc     : doc,
        input   : input,
        settings: settings
    };
};
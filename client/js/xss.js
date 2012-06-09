/*jshint globalstrict:true */
'use strict';

$(function() {
    XSS.init();
});

var XSS = {

    settings: {
        width   : 256, // Tiles wide
        height  : 160, // Tiles high
        s       : 4    // Tile size
    },

    init: function() {

        if (!this.detectCanvas()) {
            $(document.body).text('Your browser does not support canvas.');
            return false;
        } else if (!this.getWebSocket()) {
            $(document.body).text('Your browser does not support websockets.');
            return false;
        }

        if (!window.requestAnimationFrame) {
            this.setRequestAnimationFrame();
        }

        // DOM
        this.input = $('<input>').appendTo(document.body).attr({autofocus: true});

        $(document).on('keydown', function(e) {
            switch (e.which) {
                case 13: $(document).trigger('/xss/key/enter'); break;
                case 8:  $(document).trigger('/xss/key/backspace'); break;
                case 27: $(document).trigger('/xss/key/escape'); break;
                case 37: $(document).trigger('/xss/key/left'); break;
                case 38: $(document).trigger('/xss/key/up'); break;
                case 39: $(document).trigger('/xss/key/right');break;
                case 40: $(document).trigger('/xss/key/down'); break;
            }
        });

        // Objects
        this.canvas    = new XSS.Canvas();
        this.socket    = new XSS.WebSocket();
        this.font      = new XSS.Font();
        this.drawables = new XSS.Drawables();
        this.effects   = new XSS.Effects();
        this.menu      = new XSS.Menu();

        // Shortcuts
        this.send      = this.socket.send;
    },

    detectCanvas: function() {
        return window.CanvasRenderingContext2D;
    },

    getWebSocket: function() {
        return window.WebSocket || window.MozWebSocket;
    },

    setRequestAnimationFrame: function() {
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var i = 0, m = vendors.length; i < m && !window.requestAnimationFrame; i++) {
            window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        }
    }

};
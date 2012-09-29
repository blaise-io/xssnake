/*jshint globalstrict:true*/
/*globals Utils, Canvas, Drawables, Effects, Font, Menu, Stages, Socket, Game*/

'use strict';

var XSS = {};

/** @const */ XSS.PIXELS_H = 256;
/** @const */ XSS.PIXELS_V = 160;
/** @const */ XSS.PIXEL_SIZE = 4;

/** @const */ XSS.CANVAS_WIDTH = XSS.PIXELS_H * XSS.PIXEL_SIZE;
/** @const */ XSS.CANVAS_HEIGHT = XSS.PIXELS_V * XSS.PIXEL_SIZE;

/** @const */ XSS.KEY_BACKSPACE = 8;
/** @const */ XSS.KEY_ENTER = 13;
/** @const */ XSS.KEY_ESCAPE = 27;
/** @const */ XSS.KEY_LEFT = 37;
/** @const */ XSS.KEY_UP = 38;
/** @const */ XSS.KEY_RIGHT = 39;
/** @const */ XSS.KEY_DOWN = 40;

/** @const */ XSS.DIRECTION_LEFT = 0;
/** @const */ XSS.DIRECTION_UP = 1;
/** @const */ XSS.DIRECTION_RIGHT = 2;
/** @const */ XSS.DIRECTION_DOWN = 3;

/** @const */ XSS.MENU_LEFT = 40;
/** @const */ XSS.MENU_TOP = 64;

/** @const */ XSS.GAME_LEFT = 2;
/** @const */ XSS.GAME_TOP = 2;
/** @const */ XSS.GAME_TILE = 4;

window.onerror = function() {
    XSS.error = true; // Stops draw loop
};

window.onload = function() {

    XSS.doc       = document.body;
    XSS.input     = document.createElement('input');
                    XSS.doc.appendChild(XSS.input);

    XSS.utils     = new Utils();
    XSS.canvas    = new Canvas();
    XSS.drawables = new Drawables();
    XSS.effects   = new Effects();
    XSS.font      = new Font();
    XSS.menu      = new Menu();
    XSS.stages    = new Stages();

    // Shortcuts
    XSS.ents      = XSS.canvas.entities;
    XSS.on        = XSS.utils.addListener;
    XSS.off       = XSS.utils.removeListener;

//    Init stages
//    XSS.stages.init();

//    XSS.game = new Game();

    XSS.socket = new Socket(function() {
        var data = {
            'name'    : window.location.search.substring(1),
            'friendly': true,
            'pub'     : true,
            'capacity': 3
        };
        XSS.socket.emit('/s/room', data);
    });

};
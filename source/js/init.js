/*jshint globalstrict:true*/
/*globals Utils, PublishSubscribe, Canvas, Shapes, Transform, Font, StageFlow, Socket */

'use strict';

var XSS = {};
var module = {}; // Dummy container for Requirejs client-server shared objects

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
/** @const */ XSS.GAME_TICK = 'TICK';

window.onerror = function() {
    XSS.error = true; // Stops draw loop
};

window.onload = function() {

    delete window.module; // Clean up dummy container

    XSS.shapes    = {};

    // DOM
    XSS.doc       = document.body;
    XSS.input     = document.createElement('input');
                    XSS.doc.appendChild(XSS.input);

    // Shortcuts
    XSS.on        = Utils.addListener;
    XSS.off       = Utils.removeListener;

    // Singletons
    XSS.pubsub    = new PublishSubscribe();
    XSS.canvas    = new Canvas();
    XSS.shapegen  = new Shapes();
    XSS.transform = new Transform();
    XSS.font      = new Font();

    // Start flow
    XSS.stageflow = new StageFlow();

    console.log(1);
    XSS.socket = new Socket(function() {
        console.log(2);
        var data = {
            'name'    : window.location.search.substring(1) || 'Anon',
            'friendly': true,
            'pub'     : true,
            'capacity': 2
        };
        console.log(3);
        XSS.socket.emit(XSS.events.SERVER_ROOM_MATCH, data);
    });

};
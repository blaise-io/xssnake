/*jshint globalstrict:true, es5:true, sub:true*/
/*globals Util, PublishSubscribe, Canvas, ShapeGenerator, Transform, Font, StageFlow, Socket */
'use strict';

// Dummy container for Requirejs client-server shared objects
var module = {};

var XSS = {};

/** @const */ XSS.PIXELS_H = 256;
/** @const */ XSS.PIXELS_V = 161;

/** @const */ XSS.KEY_BACKSPACE = 8;
/** @const */ XSS.KEY_TAB = 9;
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
/** @const */ XSS.MENU_TOP = 62;

/** @const */ XSS.GAME_LEFT = 2;
/** @const */ XSS.GAME_TOP = 2;
/** @const */ XSS.GAME_TILE = 4;
/** @const */ XSS.GAME_TICK = 'TICK';

/** @const */ XSS.FLASH_SLOW = 450;
/** @const */ XSS.FLASH_NORMAL = 300;
/** @const */ XSS.FLASH_FAST = 150;

window.onerror = function() {
    XSS.error = true; // Stops draw loop
};

XSS.main = function() {

    /** @type {Object.<string,Shape>} */
    XSS.shapes    = {};

    /** @type {Object.<string,Shape>} */
    XSS.overlays  = {};

    // DOM
    XSS.doc       = document.body;

    // Shortcuts
    XSS.on        = Util.addListener;
    XSS.off       = Util.removeListener;

    // Singletons
    XSS.pubsub    = new PublishSubscribe();
    XSS.canvas    = new Canvas();
    XSS.shapegen  = new ShapeGenerator();
    XSS.transform = new Transform();
    XSS.font      = new Font();

    XSS.stageflow = new StageFlow();

    XSS.socket = new Socket(function() {
        var data = {
            'name'    : decodeURIComponent(location.search).substring(1) ||
                        localStorage && localStorage.getItem('name') ||
                        'Anon',
            'friendly': true,
            'pub'     : true
        };
        XSS.socket.emit(XSS.events.SERVER_ROOM_MATCH, data);
    });

};

// Give Chrome a chance to initialize @font-face
window.onload = function() {
    window.setTimeout(XSS.main, 100);
};
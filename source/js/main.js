/*jshint globalstrict:true, es5:true, sub:true*/
/*globals Util, PublishSubscribe, Canvas, ShapeGenerator, Transform, Font, StageFlow, Socket */
'use strict';

// Dummy object for Requirejs client+server shared objects
var module = {};

var XSS = {};

window.onerror = function() {
    XSS.error = true; // Stops draw loop
};

XSS.load = function() {
    /** @type {Object.<string,Shape>} */
    XSS.shapes    = {};

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
};

// Load this part when font has loaded
XSS.fontLoad = function() {

    XSS.font      = new Font();
    XSS.stageflow = new StageFlow();
    XSS.socket    = new Socket(function() {
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

// Give Webkit time to initialize @font-face
document.body.onload = function() {
    XSS.load();
    setTimeout(XSS.fontLoad, 500);
};
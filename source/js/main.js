/*jshint globalstrict:true, es5:true, sub:true*/
/*globals PublishSubscribe, Canvas, ShapeGenerator, Transform, Font, StageFlow, ClientLevel */
'use strict';

var XSS = {}, module = {};

window.onerror = function() {
    XSS.error = true;
};

XSS.main = function() {

    /** @type {Object.<string,Shape>} */
    XSS.shapes     = {};

    // Shortcuts
    XSS.doc        = document.body;
    XSS.on         = XSS.util.addListener;
    XSS.off        = XSS.util.removeListener;

    // Singletons
    XSS.pubsub     = new PublishSubscribe();
    XSS.canvas     = new Canvas();
    XSS.shapegen   = new ShapeGenerator();
    XSS.transform  = new Transform();
    XSS.font       = new Font();
    XSS.stageflow  = new StageFlow();

    // Preloading
    ClientLevel.prototype.generateLevelCache();
};

XSS.check = window.setInterval(function() {
    if (document.readyState === 'complete') {
        module = null;
        window.clearInterval(XSS.check);
        window.setTimeout(XSS.main, 50);
    }
}, 50);
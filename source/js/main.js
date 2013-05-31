/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals PublishSubscribe, Font, Canvas, LevelCache, ShapeGenerator, Transform, AudioPlay, StageFlow */
'use strict';

var XSS = {}, CONST = {}, module = {};

window.onerror = function() {
    XSS.error = true;
};

document.addEventListener('DOMContentLoaded', function() {

    /** @type {Object.<string, Shape>} */
    XSS.shapes = {};

    // Global instances
    XSS.pubsub    = new PublishSubscribe();
    XSS.font      = new Font();
    XSS.canvas    = new Canvas();
    XSS.level     = new LevelCache();
    XSS.shapegen  = new ShapeGenerator();
    XSS.transform = new Transform();
    XSS.play      = new AudioPlay();
    XSS.flow      = new StageFlow();

}, false);

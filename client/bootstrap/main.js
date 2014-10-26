'use strict';

document.addEventListener('DOMContentLoaded', function() {

    /** @type {!Object.<string, xss.Shape>} */
    xss.shapes = {};

    xss.bootstrap.registerErrorHandler();
    xss.bootstrap.registerColorSchemes();
    xss.bootstrap.preloadAsyncData();
    xss.bootstrap.registerLevels(xss.util.noop);

    xss.event     = new xss.EventHandler();
    xss.font      = new xss.Font();
    xss.canvas    = new xss.Canvas();
    xss.shapegen  = new xss.ShapeGenerator();
    xss.transform = new xss.Transform();
    xss.play      = new xss.AudioPlay();
    xss.flow      = new xss.StageFlow();

//    // Global instances
//    xss.levels    = new xss.LevelRegistry();

}, false);

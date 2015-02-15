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
    xss.shapegen  = new xss.ClientShapeGenerator();
    xss.transform = new xss.Transform();
    xss.audio     = new xss.AudioPlayer();
    xss.flow      = new xss.StageFlow();

}, false);

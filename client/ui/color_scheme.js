'use strict';

/**
 * @param {string} title
 * @param {string} desc
 * @param {string} bg
 * @param {string} off
 * @param {string} on
 * @param {number=} ghosting
 * @constructor
 */
xss.ColorScheme = function(title, desc, bg, off, on, ghosting) {
    this.title = title;
    this.desc = desc;
    this.bg = bg;
    this.off = off;
    this.on = on;
    this.ghosting = ghosting || 0.6;
};

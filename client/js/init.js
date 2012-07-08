/*jshint globalstrict:true*/
/*globals Canvas, Drawables, Effects, Font, Menu, Stages, Socket, Game*/

'use strict';

var XSS = {};

/**
 * @type {Number}
 * @const
 */
XSS.PIXELS_H = 256;
/**
 * @type {Number}
 * @const
 */
XSS.PIXELS_V = 160;
/**
 * @type {Number}
 * @const
 */
XSS.PIXEL_SIZE = 4;

/**
 * @type {Number}
 * @const
 */
XSS.KEY_BACKSPACE = 8;

/**
 * @type {Number}
 * @const
 */
XSS.KEY_ENTER = 13;
/**
 * @type {Number}
 * @const
 */
XSS.KEY_ESCAPE = 27;
/**
 * @type {Number}
 * @const
 */
XSS.KEY_LEFT = 37;
/**
 * @type {Number}
 * @const
 */
XSS.KEY_UP = 38;
/**
 * @type {Number}
 * @const
 */
XSS.KEY_RIGHT = 39;
/**
 * @type {Number}
 * @const
 */
XSS.KEY_DOWN = 40;
/**
 * @type {Number}
 * @const
 */
XSS.DIRECTION_LEFT = 0;
/**
 * @type {Number}
 * @const
 */
XSS.DIRECTION_UP = 1;
/**
 * @type {Number}
 * @const
 */
XSS.DIRECTION_RIGHT = 2;
/**
 * @type {Number}
 * @const
 */
XSS.DIRECTION_DOWN = 3;
/**
 * @type {Number}
 * @const
 */
XSS.MENU_LEFT = 40;

/**
 * @type {Number}
 * @const
 */
XSS.MENU_TOP = 64;


$(function() {
    XSS.doc       = $('body');
    XSS.input     = $('input');

    XSS.canvas    = new Canvas();
    XSS.drawables = new Drawables();
    XSS.effects   = new Effects();
    XSS.font      = new Font();
    XSS.menu      = new Menu();
    XSS.stages    = new Stages();
    XSS.socket    = new Socket();
    XSS.game      = new Game();

    XSS.game.init();
});
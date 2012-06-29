/*jshint globalstrict:true*/
/*globals Canvas, Drawables, Effects, Font, Menu, Stages*/

'use strict';

var XSS = {};

/** @const */
XSS.HPIXELS = 256;

/** @const */
XSS.VPIXELS = 160;

/** @const */
XSS.PIXELSIZE = 4;

$(window).on('load', function() {

    XSS.doc = $(document.body);

    XSS.input = $('<input>').appendTo(XSS.doc).attr('autofocus', 1);

    XSS.doc.on('keydown', function(e) {
        switch (e.which) {
            case  8: XSS.doc.trigger('/xss/key/backspace'); break;
            case 13: XSS.doc.trigger('/xss/key/enter'); break;
            case 27: XSS.doc.trigger('/xss/key/escape'); break;
            case 37: XSS.doc.trigger('/xss/key/left'); break;
            case 38: XSS.doc.trigger('/xss/key/up'); break;
            case 39: XSS.doc.trigger('/xss/key/right'); break;
            case 40: XSS.doc.trigger('/xss/key/down'); break;
        }
    });

    XSS.canvas    = new Canvas();
    XSS.drawables = new Drawables();
    XSS.effects   = new Effects();
    XSS.font      = new Font();
    XSS.menu      = new Menu();
    XSS.stages    = new Stages();
});
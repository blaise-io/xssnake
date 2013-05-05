/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, ShapePixels, Font*/
'use strict';

/**
 * @param {string} header
 * @param {string} body
 * @param {{
     confirm: (boolean|undefined),
     width: (number|undefined),
     ok: (Function|undefined),
     cancel: (Function|undefined)
   }} settings
 * @constructor
 */
function Dialog(header, body, settings) {
    settings = settings || {};

    this.header = header;
    this.body = body;

    this.confirm = settings.confirm || false;
    this.width = settings.width || 100;
    this.okCallback = settings.ok || function() {};
    this.cancelCallback = settings.cancel || function() {};

    this._okSelected = false;

    XSS.keysBlocked = true;

    // TODO: Play a bubble sound

    this._updateShape();
    this._bindEvents();
}

Dialog.STR_OK = 'OK';
Dialog.STR_CANCEL = 'CANCEL';

Dialog.prototype = {

    destruct: function() {
        XSS.shapes.dialog = null;
        XSS.keysBlocked = false;
        XSS.off.keydown(this._handleKeysBound);
    },

    ok: function() {
        this.okCallback();
        this.destruct();
    },

    cancel: function() {
        this.cancelCallback();
        this.destruct();
    },

    /**
     * @private
     */
    _bindEvents: function() {
        this._handleKeysBound = this._handleKeys.bind(this);
        XSS.on.keydown(this._handleKeysBound);
    },

    /**
     * @param {Event} ev
     * @private
     */
    _handleKeys: function(ev) {
        switch (ev.keyCode) {
            case XSS.KEY_LEFT:
            case XSS.KEY_UP:
            case XSS.KEY_DOWN:
            case XSS.KEY_RIGHT:
                XSS.play.menu_alt();
                this._okSelected = !this._okSelected;
                this._updateShape();
                break;
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                this.cancel();
                break;
            case XSS.KEY_ENTER:
                if (this._okSelected) {
                    this.ok();
                } else {
                    this.cancel();
                }
                break;
        }
    },

    /**
     * @return {boolean}
     * @private
     */
    _isIngame: function() {
        return !!XSS.shapes.level;
    },

    /**
     * @return {number}
     * @private
     */
    _getAreaHeight: function() {
        var height = XSS.HEIGHT;
        if (this._isIngame() && XSS.levelCache[0]) {
            height = XSS.levelCache[0].height * XSS.GAME_TILE;
        }
        return height;
    },

    /**
     * @return {number}
     * @private
     */
    _getContentWidth: function() {
        return Math.max(this.width, XSS.font.width(this.header) * 2);
    },

    /**
     * @return {ShapePixels}
     * @private
     */
    _getHeaderPixels: function() {
        var header;
        header = XSS.font.pixels(this.header, 0, 0);
        header = XSS.transform.zoomX2(header, 0, 0, true);
        return header;
    },

    /**
     * @return {ShapePixels}
     * @private
     */
    _getBodyPixels: function() {
        var settings = {wrap: this._getContentWidth()};
        return XSS.font.pixels(this.body, 0, 1 + Font.MAX_HEIGHT * 2, settings);
    },

    /**
     * @return {ShapePixels}
     * @private
     */
    _getConfirmPixels: function() {
        var x, y, cancel, ok, line, okSelect = this._okSelected;

        x = XSS.font.width(Dialog.STR_CANCEL) + 5;
        y = 2 + Font.MAX_HEIGHT * 4 + XSS.font.height(this.body);

        cancel = XSS.font.pixels(Dialog.STR_CANCEL, 1, y, {invert: !okSelect});
        ok = XSS.font.pixels(Dialog.STR_OK, x, y, {invert: okSelect});

        line = XSS.shapegen.line(0, y - 5, this._getContentWidth(), y - 5);

        return new Shape(ok, cancel, line).pixels;
    },

    /**
     * @private
     */
    _updateShape: function() {
        var shape, header, body, confirm = new ShapePixels();

        header = this._getHeaderPixels();
        body = this._getBodyPixels();

        if (this.confirm) {
            confirm = this._getConfirmPixels();
        }

        shape = new Shape(header, body, confirm);
        shape.clearBBox = true;

        shape.outline();
        shape.center(0, this._getAreaHeight());

        XSS.shapes.dialog = shape;
    }

};
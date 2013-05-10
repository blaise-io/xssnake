/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, ShapePixels, Font*/
'use strict';

/** @typedef {{
     blockKeys: (boolean|undefined),
     type: (number|undefined),
     width: (number|undefined),
     ok: (Function|undefined),
     cancel: (Function|undefined)
   }} */
var DialogSettings;

/**
 * @param {string} header
 * @param {string} body
 * @param {DialogSettings|Object=} settings
 * @constructor
 */
function Dialog(header, body, settings) {
    settings = settings || {};

    this._header = header;
    this._body = body;

    this.type = settings.type || Dialog.TYPE.INFO;
    this.width = settings.width || Dialog.MIN_WIDTH;
    this.okCallback = settings.ok || function() {};
    this.cancelCallback = settings.cancel || function() {};

    XSS.keysBlocked = (typeof settings.blockKeys === 'undefined') ?
        true : settings.blockKeys;

    if (this.type === Dialog.TYPE.ALERT) {
        this._okSelected = true;
        this._bindEvents();
    } else if (this.type === Dialog.TYPE.CONFIRM) {
        this._okSelected = false;
        this._bindEvents();
    }

    this._updateShape();
    // TODO: Play a bubble sound
}

Dialog.MIN_WIDTH = 80;
Dialog.STR_OK = 'OK';
Dialog.STR_CANCEL = 'CANCEL';

/** @enum {number} */
Dialog.TYPE = {
    INFO   : 0, // No buttons, not closable
    ALERT  : 1, // OK button, closable
    CONFIRM: 2  // OK and CANCEL button
};

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
     * @param {string} header
     */
    setHeader: function(header) {
        XSS.play.menu_alt();
        this._header = header;
        this._updateShape();
    },

    /**
     * @param {string} body
     */
    setBody: function(body) {
        XSS.play.menu_alt();
        this._body = body;
        this._updateShape();
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
                if (this.type === Dialog.TYPE.CONFIRM) {
                    XSS.play.menu_alt();
                    this._okSelected = !this._okSelected;
                    this._updateShape();
                }
                break;
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                if (this.type === Dialog.TYPE.CONFIRM) {
                    this.cancel();
                } else {
                    this.ok();
                }
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
        return Math.max(this.width, XSS.font.width(this._header) * 2);
    },

    /**
     * @returns {number}
     * @private
     */
    _getButtonPosition: function() {
        var bodyBBox = this._getBodyPixels().bbox();
        return Font.MAX_HEIGHT * 3 + bodyBBox.height + 4;
    },

    /**
     * @return {ShapePixels}
     * @private
     */
    _getHeaderPixels: function() {
        var header;
        header = XSS.font.pixels(this._header, 0, 0);
        header = XSS.transform.zoomX2(header, 0, 0, true);
        return header;
    },

    /**
     * @return {ShapePixels}
     * @private
     */
    _getBodyPixels: function() {
        var settings = {wrap: this._getContentWidth()};
        return XSS.font.pixels(this._body, 0, 1 + Font.MAX_HEIGHT * 2, settings);
    },

    /**
     * @param {number} y
     * @return {ShapePixels}
     * @private
     */
    _getLine: function(y) {
        return XSS.shapegen.line(0, y - 5, this._getContentWidth(), y - 5);
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {ShapePixels}
     * @private
     */
    _getCancelButton: function(x, y) {
        return XSS.font.pixels(Dialog.STR_CANCEL, x, y, {invert: !this._okSelected});
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {ShapePixels}
     * @private
     */
    _getOkButton: function(x, y) {
        return XSS.font.pixels(Dialog.STR_OK, x, y, {invert: this._okSelected});
    },

    /**
     * @return {ShapePixels}
     * @private
     */
    _getAlertPixels: function() {
        var y, ok, line;

        y = this._getButtonPosition();
        ok = this._getOkButton(1, y);
        line = this._getLine(y);

        return new Shape(ok, line).pixels;
    },

    /**
     * @return {ShapePixels}
     * @private
     */
    _getConfirmPixels: function() {
        var x, y, cancel, ok, line;

        x = XSS.font.width(Dialog.STR_CANCEL) + 5;
        y = this._getButtonPosition();
        cancel = this._getCancelButton(1, y);
        ok = this._getOkButton(x, y);
        line = this._getLine(y);

        return new Shape(ok, cancel, line).pixels;
    },

    /**
     * @private
     */
    _updateShape: function() {
        var shape, header, body, buttons = new ShapePixels();

        header = this._getHeaderPixels();
        body = this._getBodyPixels();

        switch (this.type) {
            case Dialog.TYPE.ALERT:
                buttons = this._getAlertPixels();
                break;
            case Dialog.TYPE.CONFIRM:
                buttons = this._getConfirmPixels();
                break;
        }

        shape = new Shape(header, body, buttons);
        shape.clearBBox = true;

        shape.outline();
        shape.center(0, this._getAreaHeight());

        XSS.shapes.dialog = shape;
    }

};

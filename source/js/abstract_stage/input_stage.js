/*jshint globalstrict:true, expr:true, sub:true*/
/*globals XSS, CONST, Shape, InputField */
'use strict';

/**
 * BaseInputStage
 * Stage with a form input
 * @implements {StageInterface}
 * @constructor
 */
function InputStage() {
    this.value = XSS.util.storage(this.name) || '';
    this._inputTop = CONST.MENU_TOP + 17;
    this._shape = this._getShape();
}

InputStage.prototype = {

    name: '',
    header: '',
    label: '',
    next: InputStage,

    minChars: 0,
    maxChars: 0,
    maxValWidth: 0,
    displayWidth: 0,

    /**
     * @returns {Shape}
     */
    getShape: function() {
        return this._shape;
    },

    /**
     * @returns {Object}
     */
    getData: function() {
        return {};
    },

    /**
     * @return {string}
     */
    getValue: function() {
        return this.value;
    },

    construct: function() {
        this.input = this._setupInputField();
        this._shape = this._getShapeExcludeValue();
        this._bindEvents();
    },

    destruct: function() {
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.message = null;
        this._shape = this._getShape();
        this.input.destruct();
        if (this.name) {
            XSS.util.storage(this.name, this.value);
        }
    },

    /**
     * @param {string} error
     * @param {string} value
     * @param {number} top
     */
    inputSubmit: function(error, value, top) {
        if (!error && value && top) {
            XSS.flow.switchStage(this.next);
            XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_INPUT);
        } else {
            XSS.shapes.message = XSS.font.shape(error, CONST.MENU_LEFT, top);
            XSS.shapes.message.lifetime(0, 500);
        }
    },

    _setupInputField: function() {
        var input = new InputField(CONST.MENU_LEFT, this._inputTop, this.label);

        input.maxValWidth = this.maxValWidth || input.maxValWidth;
        input.displayWidth = this.displayWidth || input.displayWidth;

        input.callback = function(value) {
            this.value = value;
        }.bind(this);

        input.setValue(this.value);

        return input;
    },

    /**
     * @private
     */
    _bindEvents: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this._handleKeys.bind(this));
    },

    /**
     * @private
     */
    _handleKeys: function(ev) {
        var value, labelHeight, top;
        switch (ev.keyCode) {
            case CONST.KEY_ESCAPE:
                XSS.flow.previousStage();
                ev.preventDefault();
                break;
            case CONST.KEY_ENTER:
                value = this.value.trim();
                labelHeight = XSS.font.height(this.label);
                top = labelHeight + CONST.MENU_TOP + CONST.MENU_TITLE_HEIGHT - 3;
                this.inputSubmit(this._getInputError(value), value, top);
        }
    },

    /**
     * @param {string} val
     * @return {string}
     * @private
     */
    _getInputError: function(val) {
        if (val.length < this.minChars) {
            return 'Too short!!';
        } else if (this.maxChars && val.length > this.maxChars) {
            return 'Too long!!';
        }
        return '';
    },

    /**
     * @returns {Shape}
     * @private
     */
    _getShape: function() {
        var shape = this._getShapeExcludeValue();
        shape.add(this._getDataShape().pixels);
        return shape;
    },

    /**
     * @return {Shape}
     * @private
     */
    _getShapeExcludeValue: function() {
        var pixels = XSS.font.pixels(this.header);
        pixels = XSS.transform.zoomX2(pixels, CONST.MENU_LEFT, CONST.MENU_TOP, true);
        return new Shape(pixels);
    },

    /**
     * @return {Shape}
     * @private
     */
    _getDataShape: function() {
        var value = this.label + this.value;
        return new Shape(XSS.font.pixels(value, CONST.MENU_LEFT, this._inputTop));
    }

};

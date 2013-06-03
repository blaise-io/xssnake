/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Shape, InputField */
'use strict';

/**
 * BaseInputStage
 * Stage with a form input
 * @implements {StageInterface}
 * @constructor
 */
function InputStage() {
    this._val = XSS.util.storage(this.name) || '';
    this._inputTop = CONST.MENU_TOP + 17;
    this._shape = this._getShape(true);
}

InputStage.prototype = {

    name: '',
    header: '',
    label: '',
    nextStage: InputStage,

    minChars: 0,
    maxChars: 0,
    maxValWidth: 0,
    displayWidth: 0,

    getShape: function() {
        return this._shape;
    },

    getValue: function() {
        return this._val;
    },

    construct: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this.handleKeys.bind(this));

        this.input = new InputField(CONST.MENU_LEFT, this._inputTop, this.label);
        this.input.maxValWidth = this.maxValWidth || this.input.maxValWidth;
        this.input.displayWidth = this.displayWidth || this.input.displayWidth;

        this.input.callback = function(value) {
            XSS.util.storage(this.name, value);
            this._val = value;
        }.bind(this);

        // Apply properties
        this.input.setValue(this._val);

        // Label and input are rendered separately by InputField
        XSS.shapes.stage = this._getShape(false);
    },

    destruct: function() {
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.message = null;
        this._shape = this._getShape(true);
        this.input.destruct();
    },

    handleKeys: function(e) {
        var value, labelHeight, top;
        switch (e.keyCode) {
            case CONST.KEY_ESCAPE:
                XSS.flow.previousStage();
                e.preventDefault();
                break;
            case CONST.KEY_ENTER:
                value = this._val.trim();
                labelHeight = XSS.font.height(this.label);
                top = labelHeight + CONST.MENU_TOP + CONST.MENU_TITLE_HEIGHT - 3;
                this.inputSubmit(this._getInputError(value), value, top);
        }
    },

    /**
     * @param {string} error
     * @param {string} value
     * @param {number} top
     */
    inputSubmit: function(error, value, top) {
        if (!error && value && top) {
            XSS.flow.switchStage(this.nextStage);
            XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_INPUT);
        } else {
            XSS.shapes.message = XSS.font.shape(error, CONST.MENU_LEFT, top);
            XSS.shapes.message.lifetime(0, 500);
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
     * @param {boolean} includeValue
     * @returns {Shape}
     * @private
     */
    _getShape: function(includeValue) {
        var shape = this._getHeaderShape();
        if (includeValue) {
            shape.add(this._getValueShape().pixels);
        }
        return shape;
    },

    /**
     * @return {Shape}
     * @private
     */
    _getHeaderShape: function() {
        var pixels = XSS.font.pixels(this.header);
        pixels = XSS.transform.zoomX2(pixels, CONST.MENU_LEFT, CONST.MENU_TOP, true);
        return new Shape(pixels);
    },

    /**
     * @return {Shape}
     * @private
     */
    _getValueShape: function() {
        var value = this.label + this._val;
        return new Shape(XSS.font.pixels(value, CONST.MENU_LEFT, this._inputTop));
    }

};

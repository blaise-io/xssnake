'use strict';

/**
 * BaseInputStage
 * Stage with a form input
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.InputStage = function() {
    /** @type {string} */
    this.value = xss.util.storage(this.name) || '';
    this._inputTop = xss.MENU_TOP + 17;
    this.fontOptions = {wrap: xss.MENU_LEFT + xss.MENU_WIDTH - 25};
    this._shape = this._getShape();
};

xss.InputStage.prototype = {

    name: '',
    header: '',
    label: '',
    next: xss.InputStage,

    minlength: 0,
    maxChars: 0,
    maxwidth: 0,
    displayWidth: 0,

    /**
     * @return {xss.Shape}
     */
    getShape: function() {
        return this._shape;
    },

    /**
     * @return {Object}
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
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES);
        xss.shapes.message = null;
        this._shape = this._getShape();
        this.input.destruct();
        if (this.name) {
            xss.util.storage(this.name, this.value);
        }
    },

    /**
     * @param {string} error
     * @param {string} value
     * @param {number} top
     */
    inputSubmit: function(error, value, top) {
        if (!error && value && top) {
            xss.flow.switchStage(this.next);
            xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_INPUT);
        } else {
            xss.shapes.message = xss.font.shape(error, xss.MENU_LEFT, top);
            xss.shapes.message.lifetime(0, 500);
        }
    },

    _setupInputField: function() {
        var input = new xss.InputField(
            xss.MENU_LEFT, this._inputTop, this.label, this.fontOptions
        );

        input.maxValWidth = this.maxwidth || input.maxValWidth;
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
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES, this._handleKeys.bind(this));
    },

    /**
     * @private
     */
    _handleKeys: function(ev) {
        var value, top;
        switch (ev.keyCode) {
            case xss.KEY_ESCAPE:
                xss.flow.previousStage();
                ev.preventDefault();
                break;
            case xss.KEY_ENTER:
                value = this.value.trim();
                top = xss.font.height(
                    this.label,
                    xss.MENU_LEFT,
                    this._inputTop,
                    this.fontOptions
                );
                this.inputSubmit(this._getInputError(value), value, top);
        }
    },

    /**
     * @param {string} val
     * @return {string}
     * @private
     */
    _getInputError: function(val) {
        if (val.length < this.minlength) {
            return 'Too short!!';
        } else if (this.maxChars && val.length > this.maxChars) {
            return 'Too long!!';
        }
        return '';
    },

    /**
     * @return {xss.Shape}
     * @private
     */
    _getShape: function() {
        var shape = this._getShapeExcludeValue();
        shape.add(this._getDataShape().pixels);
        return shape;
    },

    /**
     * @return {xss.Shape}
     * @private
     */
    _getShapeExcludeValue: function() {
        var pixels = xss.font.pixels(this.header);
        pixels = xss.transform.zoom(2, pixels, xss.MENU_LEFT, xss.MENU_TOP);
        return new xss.Shape(pixels);
    },

    /**
     * @return {xss.Shape}
     * @private
     */
    _getDataShape: function() {
        var value = this.label + this.value;
        return new xss.Shape(xss.font.pixels(
            value, xss.MENU_LEFT, this._inputTop, this.fontOptions
        ));
    }

};

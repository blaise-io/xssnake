'use strict';

/**
 * @param {number} x
 * @param {number} y
 * @param {string=} prefix
 * @param {Object=} fontOptions
 * @constructor
 */
xss.InputField = function(x, y, prefix, fontOptions) {
    this.x = x;
    this.y = y;
    this.prefix = prefix || '';
    this.fontOptions = fontOptions;

    this.callback = xss.util.noop;
    this.maxValWidth = null;
    this.displayWidth = xss.WIDTH - x - 8;
    this.maxlength = 156;

    this.input = this.addInputToDom();
    this.input.focus();

    xss.keysBlocked = true;
};

xss.InputField.prototype = {

    destruct: function() {
        if (this.input && this.input.parentNode) {
            this.input.parentNode.removeChild(this.input);
        }
        this.unbindEvents();
        xss.shapes.INPUT_CARET = null;
        xss.shapes.INPUT_VALUE = null;
        xss.keysBlocked = false;
    },

    unbindEvents: function() {
        xss.event.off(xss.DOM_EVENT_KEYPRESS, xss.NS_INPUT);
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_INPUT);
        xss.event.off(xss.DOM_EVENT_KEYUP, xss.NS_INPUT);
    },

    bindEvents: function() {
        xss.event.on(xss.DOM_EVENT_KEYPRESS, xss.NS_INPUT, function() { xss.audio.play('menu_alt'); });
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_INPUT, this.updateShapes.bind(this));
        xss.event.on(xss.DOM_EVENT_KEYUP, xss.NS_INPUT, this.updateShapes.bind(this));
    },

    /**
     * @param {string} value
     */
    setValue: function(value) {
        this.input.focus();
        this.input.value = value;
        this.input.setSelectionRange(value.length, value.length);
        this.bindEvents();
        this.updateShapes();
    },

    /**
     * @return {string}
     */
    getValue: function() {
        return this.input.value;
    },

    updateShapes: function() {
        this.maxwidthCutOff();
        this.callback(this.input.value);
        xss.shapes.INPUT_CARET = this.getCaretShape();
        xss.shapes.INPUT_VALUE = this.getInputValueShape();
    },

    /**
     * @return {Element}
     */
    addInputToDom: function() {
        var input = document.createElement('input');
        input.setAttribute('maxlength', String(this.maxlength));
        input.focus();
        document.body.appendChild(input);
        return input;
    },

    /**
     * @return {xss.Shape}
     */
    getCaretShape: function() {
        var segments, untilCaretStr, endPos, caret, caretShape;

        segments = this.getSelectionSegments();
        untilCaretStr = segments[0] + segments[1];
        endPos = xss.font.endPos(this.prefix + untilCaretStr, this.x, this.y, this.fontOptions);
        caret = [endPos[0] - 1, endPos[1]];

        caretShape = xss.shapegen.lineShape(
            caret[0], caret[1] - 1,
            caret[0], caret[1] + 7
        );

        caretShape.flash(xss.FRAME * 20, xss.FRAME * 20);

        return caretShape;
    },

    /**
     * @return {xss.Shape}
     */
    getInputValueShape: function() {
        var shape, values, endpos;

        values = this.getSelectionSegments();
        shape = new xss.Shape();
        shape.add(xss.font.pixels(
            this.prefix + values[0], this.x, this.y, this.fontOptions
        ));

        if (values[1]) { // Selection
            endpos = xss.font.endPos(
                this.prefix + values[0], this.x, this.y, this.fontOptions
            );
            shape.add(xss.font.pixels(values[1], endpos[0], endpos[1], {invert: true}));
        }

        endpos = xss.font.endPos(
            this.prefix + values[0] + values[1], this.x, this.y, this.fontOptions
        );

        shape.add(
            xss.font.pixels(values[2],
            endpos[0],
            endpos[1])
        );

        return shape;
    },

    /**
     * @return {Array.<string>}
     * @private
     */
    getSelectionSegments: function() {
        var input, value, start, end;

        input = this.input;
        value = input.value;
        start = input.selectionStart;
        end = input.selectionEnd;

        // Handle situation where input value is wider than display width.
        while (xss.font.width(value) > this.displayWidth) {
            if (start === 0) {
                value = value.substring(0, value.length - 2);
            } else {
                value = value.substring(1, value.length);
                start--;
                end--;
            }
        }

        return [
            value.substring(0, start),
            value.substring(start, end),
            value.substring(end)
        ];
    },

    maxwidthCutOff: function() {
        if (null !== this.maxValWidth) {
            while (xss.font.width(this.input.value) > this.maxValWidth) {
                this.input.value = this.input.value.slice(0, -1);
            }
        }
    }

};

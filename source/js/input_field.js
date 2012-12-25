/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape*/
'use strict';

/**
 * @param {number} x
 * @param {number} y
 * @param {string=} prefix
 * @param {number=} maxWidth
 * @constructor
 */
function InputField(x, y, prefix, maxWidth) {
    this.x = x;
    this.y = y;
    this.prefix = prefix || '';
    this.maxWidth = maxWidth || XSS.PIXELS_H - x;
    this.callback = null;

    this.input = this._getInput();
    this.input.focus();

    this._updateShapesBound = this._updateShapes.bind(this);
    this._updateShapes();

    XSS.on.keydown(this._updateShapesBound);
    XSS.on.keyup(this._updateShapesBound);
}

InputField.prototype = {

    _updateShapes: function() {
        this._applyMaxWidth();
        this.value = this.input.value;
        if (this.callback) {
            this.callback(this.input.value);
        }
        XSS.shapes.caret = this._caretShape();
        XSS.shapes.inputval = this._valueShape();
    },

    /**
     * @param {string} value
     */
    setValue: function(value) {
        this.input.value = ''; // Empty first puts caret at end
        this.input.value = value;
        this._updateShapes();
    },

    destruct: function() {
        if (this.input && this.input.parentNode) {
            this.input.parentNode.removeChild(this.input);
        }
        XSS.off.keydown(this._updateShapesBound);
        XSS.off.keyup(this._updateShapesBound);
        delete XSS.shapes.caret;
        delete XSS.shapes.inputval;
    },

    /**
     * @return {Element}
     * @private
     */
    _getInput: function() {
        var input = document.getElementsByTagName('input')[0];
        if (!input) {
            input = document.createElement('input');
            XSS.doc.appendChild(input);
        }
        return input;
    },

    /**
     * @return {Shape}
     * @private
     */
    _caretShape: function() {
        var untilCaretStr, endPos, caret, caretShape,
            segments = this._getValueSegments();

        if (!segments[1]) {
            untilCaretStr = segments[0] + segments[1];
            endPos = XSS.font.endPos(String(this.prefix + untilCaretStr));
            caret = [this.x + endPos[0] - 1, this.y + endPos[1]];

            caretShape = XSS.shapegen.lineShape(
                caret[0], caret[1] - 1,
                caret[0], caret[1] + 7
            );

            caretShape.flash();
        } else {
            caretShape = new Shape();
        }

        return caretShape;
    },

    /**
     * @return {Shape}
     * @private
     */
    _valueShape: function() {
        var pos, shape, values = this._getValueSegments(), endpos;

        shape = new Shape();
        shape.add(XSS.font.pixels(this.prefix + values[0], this.x, this.y));

        if (values[1]) { // Selection
            endpos = XSS.font.endPos(this.prefix + values[0]);
            pos = [this.x + endpos[0], this.y + endpos[1]];
            shape.add(XSS.font.pixels(values[1], pos[0], pos[1], true));
        }

        endpos = XSS.font.endPos(this.prefix + values[0] + values[1]);

        shape.add(
            XSS.font.pixels(values[2],
            this.x + endpos[0],
            this.y + endpos[1])
        );

        return shape;
    },

    /**
     * @return {Array.<number>}
     * @private
     */
    _getValueSegments: function() {
        var input = this.input, value = input.value;
        return [
            value.substring(0, input.selectionStart),
            value.substring(input.selectionStart, input.selectionEnd),
            value.substring(input.selectionEnd)
        ];
    },

    _applyMaxWidth: function() {
        while (XSS.font.width(this.input.value) > this.maxWidth) {
            this.input.value = this.input.value.slice(0, -1);
        }
    }

};
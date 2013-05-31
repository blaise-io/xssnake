/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Shape*/
'use strict';

/**
 * @param {number} x
 * @param {number} y
 * @param {string=} prefix
 * @constructor
 */
function InputField(x, y, prefix) {
    this.x = x;
    this.y = y;
    this.prefix = prefix || '';

    this.maxValWidth = 0;
    this.displayWidth = CONST.WIDTH - x - 8;
    this.maxlength = 156;

    this.input = this._createInput();
    this.input.focus();

    XSS.keysBlocked = true;
}

InputField.prototype = {

    /**
     * @param {string} value
     */
    setValue: function(value) {
        this.input.value = ''; // Empty first puts caret at end
        this.input.value = value;
        this._bindEvents();
        this._updateShapes();
    },

    destruct: function() {
        var ns = CONST.NS_INPUT;
        if (this.input && this.input.parentNode) {
            this.input.parentNode.removeChild(this.input);
        }
        XSS.pubsub.off(CONST.EVENT_KEYPRESS, ns);
        XSS.pubsub.off(CONST.EVENT_KEYDOWN, ns);
        XSS.pubsub.off(CONST.EVENT_KEYUP, ns);
        XSS.shapes.caret = null;
        XSS.shapes.inputval = null;
        XSS.keysBlocked = false;
    },

    /**
     * @private
     */
    _bindEvents: function() {
        var ns = CONST.NS_INPUT;
        XSS.pubsub.on(CONST.EVENT_KEYPRESS, ns, XSS.play.menu_alt);
        XSS.pubsub.on(CONST.EVENT_KEYDOWN, ns, this._updateShapes.bind(this));
        XSS.pubsub.on(CONST.EVENT_KEYUP, ns, this._updateShapes.bind(this));
    },

    /**
     * @private
     */
    _updateShapes: function() {
        // IE9 workaround for issue where _updateShapes executes
        // after event listeners are removed.
        if (!XSS.keysBlocked) { return; }

        this._applyMaxWidth();
        this.value = this.input.value;
        if (this.callback) {
            this.callback(this.input.value);
        }
        XSS.shapes.caret = this._caretShape();
        XSS.shapes.inputval = this._valueShape();
    },

    /**
     * @return {Element}
     * @private
     */
    _createInput: function() {
        var input;
        input = document.createElement('input');
        input.setAttribute('maxlength', String(this.maxlength));
        input.focus();
        document.body.appendChild(input);
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
            endPos = XSS.font.endPos(this.prefix + untilCaretStr);
            caret = [this.x + endPos[0] - 1, this.y + endPos[1]];

            caretShape = XSS.shapegen.lineShape(
                caret[0], caret[1] - 1,
                caret[0], caret[1] + 7
            );

            caretShape.flash(300, 300);
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
            shape.add(XSS.font.pixels(values[1], pos[0], pos[1], {invert: true}));
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
        var input = this.input, value = input.value, start = input.selectionStart,
            end = input.selectionEnd;

        // Handle situation where input value is wider than display width
        while (XSS.font.width(value) > this.displayWidth) {
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

    _applyMaxWidth: function() {
        if (this.maxValWidth) {
            while (XSS.font.width(this.input.value) > this.maxValWidth) {
                this.input.value = this.input.value.slice(0, -1);
            }
        }
    }

};

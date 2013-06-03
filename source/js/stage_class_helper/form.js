/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Shape, Font*/
'use strict';

/**
 * Form with choice fields
 * @param {string} header
 * @param {function(string)} next
 * @constructor
 */
function Form(header, next) {
    this.header = header;
    this.next = next;

    this.focus = 0;
    this.fields = [];
    this.selected = [];
    this._optionMaxWidth = 0;
}

Form.prototype = {

    /**
     * @param {string} name
     * @param {string} label
     * @param {Array.<Array>} options
     */
    addField: function(name, label, options) {
        this.fields.push({
            name   : name,
            label  : label,
            options: options
        });

        this.selected.push(0);

        for (var i = 0, m = options.length; i < m; i++) {
            this._optionMaxWidth = Math.max(
                this._optionMaxWidth,
                XSS.font.width(options[i][1] || String(options[i][0]))
            );
        }
    },

    /**
     * @param {number} delta
     */
    selectField: function(delta) {
        this.focus = XSS.util.normArrIndex(this.focus + delta, this.fields);
    },

    /**
     * @param {number} delta
     */
    selectOption: function(delta) {
        var focusField = this.fields[this.focus];
        if (focusField) {
            this.selected[this.focus] = XSS.util.normArrIndex(
                this.selected[this.focus] + delta,
                focusField.options
            );
        }
    },

    /**
     * @return {Shape}
     */
    getShape: function() {
        var x, optionX, y, shape;

        x = CONST.MENU_LEFT;
        y = CONST.MENU_TOP;

        optionX = CONST.MENU_LEFT + 2 + CONST.MENU_WIDTH -
                  this._optionMaxWidth - XSS.font.width(' ' + CONST.UC_TR_LEFT);

        shape = new Shape();
        shape.add(this._getHeaderPixels(x, y));

        y += CONST.MENU_TITLE_HEIGHT;

        // Draw options
        for (var i = 0, m = this.fields.length; i < m; i++) {
            var option, bbox, active = (this.focus === i);

            option = this._getOptionsShape(i, x, optionX, y, active);

            if (active) {
                bbox = option.bbox();
                bbox.x1 -= 1;
                bbox.x2 += 1;
                bbox.y1 = y - 1;
                bbox.y2 = y + Font.LINE_HEIGHT;
                option.invert();
            }

            shape.add(option.pixels);
            y += Font.LINE_HEIGHT_MENU;
        }

        return shape;
    },

    getValues: function() {
        var values = {};
        for (var i = 0, m = this.fields.length; i < m; i++) {
            var field = this.fields[i],
                optionIndex = this.selected[i];
            if (field.name) {
                values[field.name] = field.options[optionIndex][0];
            }
        }
        return values;
    },

    getNextStage: function() {
        var values = this.getValues();
        return this.next(values);
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {ShapePixels}
     * @private
     */
    _getHeaderPixels: function(x, y) {
        var header = XSS.font.pixels(this.header);
        return XSS.transform.zoomX2(header, x, y, true);
    },

    /**
     * @param {number} i
     * @param {number} x
     * @param {number} col2X
     * @param {number} y
     * @param {boolean} active
     * @return {Shape}
     * @private
     */
    _getOptionsShape: function(i, x, col2X, y, active) {
        var label, shape, value, option, pixels, xx = {};

        label = this.fields[i].label;
        shape = XSS.font.shape(label, x, y);

        option = this.fields[i].options[this.selected[i] || 0];
        value = option[1] || String(option[0]);

        xx.option = col2X + (this._optionMaxWidth - XSS.font.width(value)) / 2;
        xx.option = Math.floor(xx.option);

        pixels = XSS.font.pixels(value, xx.option, y);
        shape.add(pixels);

        xx.left = col2X - XSS.font.width(CONST.UC_TR_LEFT + ' ');
        xx.right = col2X + this._optionMaxWidth + XSS.font.width(' ');

        shape.add(
            XSS.font.pixels(active ? CONST.UC_TR_LEFT : '<', xx.left, y),
            XSS.font.pixels(active ? CONST.UC_TR_RIGHT : '>', xx.right, y)
        );

        return shape;
    }

};

'use strict';

/**
 * Form with choice fields
 * @param {string} header
 * @param {string=} footer
 * @constructor
 */
xss.Form = function(header, footer) {
    this._header = header;
    this._footer = footer || '';
    this._selectedV = 0;
    this._selectedH = [];
    this._fields = [];
    this._optionMaxWidth = 0;
};

xss.Form.prototype = {

    /**
     * @param {string} name
     * @param {string} label
     * @param {Array.<Array>} options
     */
    addField: function(name, label, options) {
        this._fields.push({
            name   : name,
            label  : label,
            options: options
        });

        this._selectedH.push(0);

        for (var i = 0, m = options.length; i < m; i++) {
            this._optionMaxWidth = Math.max(
                this._optionMaxWidth,
                xss.font.width(options[i][1] || String(options[i][0]))
            );
        }
    },

    /**
     * @param {number} delta
     */
    selectField: function(delta) {
        this._selectedV = xss.util.ensureIndexWithinBounds(
            this._selectedV + delta,
            this._fields
        );
    },

    /**
     * @param {number} delta
     */
    selectOption: function(delta) {
        var focusField = this._fields[this._selectedV];
        if (focusField) {
            this._selectedH[this._selectedV] = xss.util.ensureIndexWithinBounds(
                this._selectedH[this._selectedV] + delta,
                focusField.options
            );
        }
    },

    /**
     * @return {xss.Shape}
     */
    getShape: function() {
        var x, optionX, y, shape;

        x = xss.MENU_LEFT;
        y = xss.MENU_TOP;

        optionX = xss.MENU_LEFT + 2 + xss.MENU_WIDTH -
                  this._optionMaxWidth - xss.font.width(' ' + xss.UC_TR_LEFT);

        shape = new xss.Shape();
        shape.add(this._getHeaderPixels(x, y));
        shape.add(this._getFooterPixels(x));

        y += xss.MENU_TITLE_HEIGHT;

        // Draw options
        for (var i = 0, m = this._fields.length; i < m; i++) {
            var option, bbox, active = (this._selectedV === i);

            option = this._getOptionsShape(i, x, optionX, y, active);

            if (active) {
                bbox = option.bbox();
                bbox.x0 -= 1;
                bbox.x1 += 1;
                bbox.y0 = y - 1;
                bbox.y1 = y + xss.Font.LINE_HEIGHT;
                option.invert();
            }

            shape.add(option.pixels);
            y += xss.Font.LINE_HEIGHT_MENU;
        }

        return shape;
    },

    getData: function() {
        var values = {};
        for (var i = 0, m = this._fields.length; i < m; i++) {
            var field = this._fields[i],
                optionIndex = this._selectedH[i];
            if (field.name) {
                values[field.name] = field.options[optionIndex][0];
            }
        }
        return values;
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {xss.PixelCollection}
     * @private
     */
    _getHeaderPixels: function(x, y) {
        var header = xss.font.pixels(this._header);
        return xss.transform.zoomX2(header, x, y, true);
    },

    /**
     * @param {number} x
     * @returns {xss.PixelCollection}
     * @private
     */
    _getFooterPixels: function(x) {
        var height = xss.font.height(this._footer);
        return xss.font.pixels(this._footer, x, xss.HEIGHT - 3 - height);
    },

    /**
     * @param {number} i
     * @param {number} x
     * @param {number} col2X
     * @param {number} y
     * @param {boolean} active
     * @return {xss.Shape}
     * @private
     */
    _getOptionsShape: function(i, x, col2X, y, active) {
        var label, shape, value, option, pixels, xx = {};

        label = this._fields[i].label;
        shape = xss.font.shape(label, x, y);

        option = this._fields[i].options[this._selectedH[i] || 0];
        value = option[1] || String(option[0]);

        xx.option = col2X + (this._optionMaxWidth - xss.font.width(value)) / 2;
        xx.option = Math.floor(xx.option);

        pixels = xss.font.pixels(value, xx.option, y);
        shape.add(pixels);

        xx.left = col2X - xss.font.width(xss.UC_TR_LEFT + ' ');
        xx.right = col2X + this._optionMaxWidth + xss.font.width(' ');

        shape.add(
            xss.font.pixels(active ? xss.UC_TR_LEFT : '<', xx.left, y),
            xss.font.pixels(active ? xss.UC_TR_RIGHT : '>', xx.right, y)
        );

        return shape;
    }

};

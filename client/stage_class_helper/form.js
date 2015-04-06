'use strict';

/**
 * Form with choice fields
 * @param {string} header
 * @param {string=} footer
 * @constructor
 */
xss.Form = function(header, footer) {
    this.header = header.toUpperCase();
    this.footer = footer || '';
    this.selectedField = 0;
    this.selectedOption = [];
    this.fields = [];
    this.maxwidth = 0;
};

xss.Form.prototype = {

    /**
     * @param {number} id
     * @param {string} label
     * @param {Array.<Array>=} options
     */
    addField: function(id, label, options) {
        this.fields.push({
            id     : id,
            label  : label.toUpperCase(),
            options: options
        });

        this.selectedOption.push(0);

        for (var i = 0, m = options.length; i < m; i++) {
            this.maxwidth = Math.max(
                this.maxwidth,
                xss.font.width(options[i][1].toUpperCase())
            );
        }
    },

    /**
     * @param {number} delta
     */
    selectField: function(delta) {
        this.selectedField = xss.util.ensureIndexWithinBounds(
            this.selectedField + delta,
            this.fields
        );
    },

    /**
     * @param {number} delta
     */
    selectOption: function(delta) {
        var focusField = this.fields[this.selectedField];
        if (focusField) {
            this.selectedOption[this.selectedField] = xss.util.ensureIndexWithinBounds(
                this.selectedOption[this.selectedField] + delta,
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
                  this.maxwidth - xss.font.width(' ' + xss.UC_TR_LEFT);

        shape = new xss.Shape();
        shape.add(this._getHeaderPixels(x, y));
        shape.add(this._getFooterPixels(x));

        y += xss.MENU_TITLE_HEIGHT;

        // Draw options
        for (var i = 0, m = this.fields.length; i < m; i++) {
            var option, bbox, active = (this.selectedField === i);

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
        var values = [];
        for (var i = 0, m = this.fields.length; i < m; i++) {
            var field = this.fields[i],
            optionIndex = this.selectedOption[i];
            values[field.id] = field.options[optionIndex][0];
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
        var header = xss.font.pixels(this.header);
        return xss.transform.zoom(2, header, x, y);
    },

    /**
     * @param {number} x
     * @return {xss.PixelCollection}
     * @private
     */
    _getFooterPixels: function(x) {
        var height = xss.font.height(this.footer);
        return xss.font.pixels(this.footer, x, xss.HEIGHT - 3 - height);
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
        var label, shape, value, option, pixels, props = {};

        label = this.fields[i].label;
        shape = xss.font.shape(label, x, y);

        option = this.fields[i].options[this.selectedOption[i] || 0];
        value = option[1].toUpperCase();

        props.option = col2X + (this.maxwidth - xss.font.width(value)) / 2;
        props.option = Math.floor(props.option);

        pixels = xss.font.pixels(value, props.option, y);
        shape.add(pixels);

        props.left = col2X - xss.font.width(xss.UC_TR_LEFT + ' ');
        props.right = col2X + this.maxwidth + xss.font.width(' ');

        shape.add(
            xss.font.pixels('<', props.left, y),
            xss.font.pixels('>', props.right, y)
        );

        return shape;
    }

};

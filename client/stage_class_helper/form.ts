/**
 * Form with choice fields
 * @param {string} header
 * @param {string=} footer
 * @constructor
 */
export class Form {
    constructor(header, footer) {
    this.header = header.toUpperCase();
    this.footer = footer || '';
    this.selectedField = 0;
    this.selectedOption = [];
    this.fields = [];
    this.maxwidth = 0;
};



    /**
     * @param {number} id
     * @param {string} label
     * @param {Array.<Array>=} options
     */
    addField(id, label, options) {
        this.fields.push({
            id     : id,
            label  : label.toUpperCase(),
            options: options
        });

        this.selectedOption.push(0);

        for (var i = 0, m = options.length; i < m; i++) {
            this.maxwidth = Math.max(
                this.maxwidth,
                fontWidth(options[i][1].toUpperCase())
            );
        }
    }

    /**
     * @param {number} delta
     */
    selectField(delta) {
        this.selectedField = ensureIndexWithinBounds(
            this.selectedField + delta,
            this.fields
        );
    }

    /**
     * @param {number} delta
     */
    selectOption(delta) {
        var focusField = this.fields[this.selectedField];
        if (focusField) {
            this.selectedOption[this.selectedField] = ensureIndexWithinBounds(
                this.selectedOption[this.selectedField] + delta,
                focusField.options
            );
        }
    }

    /**
     * @return {Shape}
     */
    getShape() {
        var x, optionX, y, shape;

        x = MENU_LEFT;
        y = MENU_TOP;

        optionX = MENU_LEFT + 2 + MENU_WIDTH -
                  this.maxwidth - fontWidth(' ' + UC_TR_LEFT);

        shape = new Shape();
        shape.add(this._getHeaderPixels(x, y));
        shape.add(this._getFooterPixels(x));

        y += MENU_TITLE_HEIGHT;

        // Draw options
        for (var i = 0, m = this.fields.length; i < m; i++) {
            var option, bbox, active = (this.selectedField === i);

            option = this._getOptionsShape(i, x, optionX, y, active);

            if (active) {
                bbox = option.bbox();
                bbox.x0 -= 1;
                bbox.x1 += 1;
                bbox.y0 = y - 1;
                bbox.y1 = y + Font.LINE_HEIGHT;
                option.invert();
            }

            shape.add(option.pixels);
            y += Font.LINE_HEIGHT_MENU;
        }

        return shape;
    }    getData() {
        var values = [];
        for (var i = 0, m = this.fields.length; i < m; i++) {
            var field = this.fields[i],
            optionIndex = this.selectedOption[i];
            values[field.id] = field.options[optionIndex][0];
        }
        return values;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {PixelCollection}
     * @private
     */
    _getHeaderPixels(x, y) {
        var header = fontPixels(this.header);
        return zoom(2, header, x, y);
    }

    /**
     * @param {number} x
     * @return {PixelCollection}
     * @private
     */
    _getFooterPixels(x) {
        var height = fontHeight(this.footer);
        return fontPixels(this.footer, x, HEIGHT - 3 - height);
    }

    /**
     * @param {number} i
     * @param {number} x
     * @param {number} col2X
     * @param {number} y
     * @param {boolean} active
     * @return {Shape}
     * @private
     */
    _getOptionsShape(i, x, col2X, y, active) {
        var label, shape, value, option, pixels, props = {};

        label = this.fields[i].label;
        shape = font(label, x, y);

        option = this.fields[i].options[this.selectedOption[i] || 0];
        value = option[1].toUpperCase();

        props.option = col2X + (this.maxwidth - fontWidth(value)) / 2;
        props.option = Math.floor(props.option);

        pixels = fontPixels(value, props.option, y);
        shape.add(pixels);

        props.left = col2X - fontWidth(UC_TR_LEFT + ' ');
        props.right = col2X + this.maxwidth + fontWidth(' ');

        shape.add(
            fontPixels('<', props.left, y),
            fontPixels('>', props.right, y)
        );

        return shape;
    }

};

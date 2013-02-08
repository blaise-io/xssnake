/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, Font*/
'use strict';


/**
 * SelectMenu
 * Creates a single navigatable verticle menu
 * @param {string} name
 * @param {string=} header
 * @constructor
 */
function SelectMenu(name, header) {
    this.name = name;
    this.header = header || '';
    this.selected = 0;
    this._options = [];
}

SelectMenu.prototype = {

    /**
     * @param {?(boolean|string)} value
     * @param {function()|null} next
     * @param {string} title
     * @param {string|null} description
     * @param {function(number)=} callback
     */
    addOption: function(value, next, title, description, callback) {
        this._options.push({
            value      : value,
            next       : next,
            title      : title,
            description: description || '',
            callback   : callback
        });
    },

    /**
     * @param {number} delta
     */
    select: function(delta) {
        var index, option;
        this.selected += delta;
        index = this.getSelected();
        option = this.getFocusedOption();
        if (option.callback) {
            option.callback(index);
        }
    },

    /**
     * @return {Object}
     */
    getFocusedOption: function() {
        var selected = this.getSelected();
        return this._options[selected];
    },

    /**
     * @return {function()}
     */
    getNextStage: function() {
        return this.getFocusedOption().next;
    },

    /**
     * @return {Shape}
     */
    getShape: function() {
        var x, y, header, font, shape, desc;

        x = XSS.MENU_LEFT;
        y = XSS.MENU_TOP;

        header = XSS.transform.zoomX2(XSS.font.pixels(this.header), x, y, true);
        shape = new Shape(header);

        y += XSS.SUBHEADER_HEIGHT;

        // Draw options
        for (var i = 0, m = this._options.length; i < m; i++) {
            var title, active = (this.getSelected() === i);
            title = this._options[i].title;
            font = XSS.font.pixels(title, x, y, {invert: active});
            y += Font.LINE_HEIGHT_MENU;
            shape.add(font);
        }

        // Help text line(s)
        desc = this.getFocusedOption().description;
        y += Font.LINE_HEIGHT;
        font = XSS.font.pixels(desc, x, y, {wrap: XSS.MENU_WRAP});
        shape.add(font);

        return shape;
    },

    /**
     * @return {number}
     */
    getSelected: function() {
        if (typeof this.selected === 'undefined') {
            this.selected = 0;
        } else if (this.selected < 0) {
            this.selected = this._options.length - 1;
        } else if (this.selected > this._options.length - 1) {
            this.selected = 0;
        }
        return this.selected;
    }

};


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

        x = XSS.MENU_LEFT;
        y = XSS.MENU_TOP;

        optionX = XSS.MENU_LEFT + XSS.MENU_WIDTH -
                  this._optionMaxWidth - XSS.font.width(' ' + XSS.UC_TR_LEFT);

        shape = new Shape();
        shape.add(this._getHeaderPixels(x, y));

        y += XSS.SUBHEADER_HEIGHT;

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
     * @return {XSS.ShapePixels}
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

        xx.left = col2X - XSS.font.width(XSS.UC_TR_LEFT + ' ');
        xx.right = col2X + this._optionMaxWidth + XSS.font.width(' ');

        shape.add(
            XSS.font.pixels(active ? XSS.UC_TR_LEFT : '<', xx.left, y),
            XSS.font.pixels(active ? XSS.UC_TR_RIGHT : '>', xx.right, y)
        );

        return shape;
    }

};
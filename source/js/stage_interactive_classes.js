/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, Font, Util*/
'use strict';


/**
 * SelectMenu
 * Creates a single navigatable verticle menu
 * @param {string} name
 * @constructor
 */
function SelectMenu(name) {
    this.name = name;
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
        var x, y, font, shape, desc;

        x = XSS.MENU_LEFT;
        y = XSS.MENU_TOP;

        shape = new Shape();

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
 * @param header
 * @param submit
 * @constructor
 */
function Form(header, submit) {
    this.header = header;
    this.submit = submit;
    this.focus = 0;
    this.fields = [];
    this.selected = [];
    this._optionMaxWidth = 0;
}

Form.prototype = {

    /**
     * @param {string|null} name
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
                XSS.font.width(options[i][1])
            );
        }
    },

    /**
     * @param {number} delta
     */
    selectField: function(delta) {
        this.focus = Util.normArrIndex(
            this.focus + delta,
            this.fields.concat([1])
        );
    },

    /**
     * @param {number} delta
     */
    selectOption: function(delta) {
        var focusField = this.fields[this.focus];
        if (focusField) {
            this.selected[this.focus] = Util.normArrIndex(
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
        y = XSS.MENU_TOP - 4;

        optionX = XSS.MENU_LEFT + XSS.MENU_WIDTH -
                  this._optionMaxWidth - XSS.font.width(' >');

        shape = new Shape();
        shape.add(this._getHeaderPixels(x, y));

        y += 17;

        // Draw options
        for (var i = 0, m = this.fields.length; i < m; i++) {
            var option, bbox, active = (this.focus === i);

            option = this._getOptionsShape(i, x, optionX, y);

            if (active) {
                bbox = option.bbox();
                bbox.x1 -= 1;
                bbox.x2 += 1;
                bbox.y1 -= 2;
                bbox.y2 = bbox.y1 + Font.LINE_HEIGHT_MENU;
                option.invert();
            }

            shape.add(option.pixels);
            y += Font.LINE_HEIGHT_MENU;
        }

        shape.add(this._getSubmitPixels(y + Font.LINE_HEIGHT_MENU));

        return shape;
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
     * @param {number} y
     * @return {XSS.ShapePixels}
     * @private
     */
    _getSubmitPixels: function(y) {
        return XSS.font.pixels(
            this.submit,
            XSS.MENU_LEFT + XSS.MENU_WIDTH - XSS.font.width(this.submit),
            y,
            {invert: this.focus === this.fields.length}
        );
    },

    /**
     * @param {number} i
     * @param {number} x
     * @param {number} col2X
     * @param {number} y
     * @return {Shape}
     * @private
     */
    _getOptionsShape: function(i, x, col2X, y) {
        var label, value, optionPixels, optionX, shape, field;

        field = this.fields[i];

        label = field.label;
        shape = XSS.font.shape(label, x, y);

        value = field.options[this.selected[i] || 0][1];

        optionX = col2X + (this._optionMaxWidth - XSS.font.width(value)) / 2;
        optionX = Math.floor(optionX);

        optionPixels = XSS.font.pixels(value, optionX, y);
        shape.add(optionPixels);

        shape.add(
            XSS.font.pixels('<', col2X - XSS.font.width('< '), y),
            XSS.font.pixels('>', col2X + this._optionMaxWidth + 3, y)
        );

        return shape;
    }

};
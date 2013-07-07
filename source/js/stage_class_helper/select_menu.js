/*jshint globalstrict:true, expr:true, sub:true*/
/*globals XSS, CONST, Font, Shape*/
'use strict';

/**
 * SelectMenu
 * Creates a single navigatable verticle menu
 * @param {(string|Function)=} header
 * @param {string=} footer
 * @constructor
 */
function SelectMenu(header, footer) {
    this._header = header || '';
    this._footer = footer || '';
    this._selected = 0;
    this._options = [];
}

SelectMenu.prototype = {

    /**
     * @param {?(boolean|string|number)} value
     * @param {function()|null} next
     * @param {string} title
     * @param {string=} description
     * @param {function(number)=} callback
     */
    addOption: function(value, next, title, description, callback) {
        this._options.push({
            value      : value,
            next       : next,
            title      : title,
            description: description || '',
            callback   : callback || XSS.util.dummy
        });
    },

    /**
     * @returns {number}
     */
    prev: function() {
        return this.select(this._selected - 1);
    },

    /**
     * @returns {number}
     */
    next: function() {
        return this.select(this._selected + 1);
    },

    /**
     * @param {number} select
     * @returns {number}
     */
    select: function(select) {
        var max = this._options.length - 1;

        if (typeof select !== 'number') {
            select = 0;
        } if (select < 0) {
            select = max;
        } else if (select > max) {
            select = 0;
        }

        this._selected = select;
        this.getSelectedOption().callback(this._selected);
        return select;
    },

    /**
     * @return {Object}
     */
    getSelectedOption: function() {
        return this._options[this._selected];
    },

    /**
     * @return {Function}
     */
    getNextStage: function() {
        return this.getSelectedOption().next;
    },

    /**
     * @return {Shape}
     */
    getShape: function() {
        var x, y, header, headerPixels, shape, desc;

        x = CONST.MENU_LEFT;
        y = CONST.MENU_TOP;

        // Header
        header = (typeof this._header === 'string') ? this._header : this._header();
        headerPixels = XSS.font.pixels(header);
        headerPixels = XSS.transform.zoomX2(headerPixels, x, y, true);
        shape = new Shape(headerPixels);
        y += CONST.MENU_TITLE_HEIGHT;

        // Footer
        shape.add(XSS.font.pixels(
            this._footer, x, CONST.HEIGHT - 3 - XSS.font.height(this._footer)
        ));

        // Draw options
        for (var i = 0, m = this._options.length; i < m; i++) {
            var title, active = (this._selected === i);
            title = this._options[i].title;
            shape.add(XSS.font.pixels(title, x, y, {invert: active}));
            y += Font.LINE_HEIGHT_MENU;
        }

        // Help text line(s)
        if (this._options.length) {
            desc = this.getSelectedOption().description;
            y += Font.LINE_HEIGHT;
            shape.add(XSS.font.pixels(desc, x, y, {wrap: CONST.MENU_WRAP}));
        }

        return shape;
    }

};

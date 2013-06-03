/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Font, Shape*/
'use strict';

/**
 * SelectMenu
 * Creates a single navigatable verticle menu
 * @param {string} name
 * @param {string=} header
 * @param {string=} footer
 * @constructor
 */
function SelectMenu(name, header, footer) {
    this.name = name;
    this.header = header || '';
    this.footer = footer || '';
    this.selected = 0;
    this._options = [];
}

SelectMenu.prototype = {

    /**
     * @param {?(boolean|string)} value
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
        var x, y, header, footer, font, shape, desc;

        x = CONST.MENU_LEFT;
        y = CONST.MENU_TOP;

        // Header
        header = XSS.transform.zoomX2(XSS.font.pixels(this.header), x, y, true);
        shape = new Shape(header);
        y += CONST.MENU_TITLE_HEIGHT;

        // Footer
        footer = XSS.font.pixels(
            this.footer, x, CONST.HEIGHT - 3 - XSS.font.height(this.footer)
        );
        shape.add(footer);

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
        font = XSS.font.pixels(desc, x, y, {wrap: CONST.MENU_WRAP});
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

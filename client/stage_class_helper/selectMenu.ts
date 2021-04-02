/**
 * SelectMenu
 * Creates a single navigatable verticle menu
 * @param {(string|Function)=} header
 * @param {string=} footer
 * @constructor
 */
export class SelectMenu {
    constructor(header, footer) {
    this.header = header || '';
    this.footer = footer || '';
    this._selected = 0;
    this._options = [];
};



    /**
     * @param {?(boolean|string|number)} value
     * @param {function()|null} next
     * @param {string} title
     * @param {string=} description
     * @param {function(number)=} callback
     */
    addOption(value, next, title, description, callback) {
        this._options.push({
            value      : value,
            next       : next,
            title      : title.toUpperCase(),
            description: description || '',
            callback   : callback || noop
        });
    }

    /**
     * @return {number}
     */
    prev() {
        return this.select(this._selected - 1);
    }

    /**
     * @return {number}
     */
    next() {
        return this.select(this._selected + 1);
    }

    /**
     * @param {number} select
     * @return {number}
     */
    select(select) {
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
    }

    /**
     * @return {Object}
     */
    getSelectedOption() {
        return this._options[this._selected];
    }

    /**
     * @return {Function}
     */
    getNextStage() {
        return this.getSelectedOption().next;
    }

    /**
     * @return {Shape}
     */
    getShape() {
        var x, y, header, headerPixels, shape, desc;

        x = MENU_LEFT;
        y = MENU_TOP;

        // Header
        header = (typeof this.header === 'string') ? this.header : this.header();
        headerPixels = fontPixels(header);
        headerPixels = zoom(2, headerPixels, x, y);
        shape = new Shape(headerPixels);
        y += MENU_TITLE_HEIGHT;

        // Footer
        shape.add(fontPixels(
            this.footer, x, HEIGHT - 3 - fontHeight(this.footer)
        ));

        // Draw options
        for (var i = 0, m = this._options.length; i < m; i++) {
            var title, active = (this._selected === i);
            title = this._options[i].title;
            shape.add(fontPixels(title, x, y, {invert: active}));
            y += Font.LINE_HEIGHT_MENU;
        }

        // Help text line(s)
        if (this._options.length) {
            desc = this.getSelectedOption().description;
            y += Font.LINE_HEIGHT;
            shape.add(fontPixels(desc, x, y, {wrap: MENU_WRAP}));
        }

        return shape;
    }

};

/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, Socket, InputField, Util, Font*/

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
        option = this.getSelectedOption();
        if (option.callback) {
            option.callback(index);
        }
    },

    /**
     * @return {Object}
     */
    getSelectedOption: function() {
        var selected = this.getSelected();
        return this._options[selected];
    },

    /**
     * @return {function()}
     */
    getNextStage: function() {
        return this.getSelectedOption().next;
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
            var active, title;
            active = (this.getSelected() === i);
            title = this._options[i].title;
            font = XSS.font.pixels(title, x, y + (i * 9), active);
            shape.add(font);
        }

        // Help text line(s)
        desc = this.getSelectedOption().description;
        font = XSS.font.pixels(desc, x, y + ((m + 2) * Font.LINE_HEIGHT));
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
 * @interface
 */
function StageInterface() {}

StageInterface.prototype = {
    /** @return {string} */
    getInstruction: function() {
        return '';
    },

    /** @return {Shape} */
    getShape: function() {
        return new Shape();
    },

    /** @return */
    createStage: function() {
    },

    /** @return */
    destroyStage: function() {
    }
};


/**
 * BaseInputStage
 * Stage with a form input
 * @param {string} name
 * @param {Function} nextStage
 * @param {string} label
 * @param {number=} maxWidth
 * @constructor
 * @implements {StageInterface}
 */
function InputStage(name, nextStage, label, maxWidth) {
    this.name = name;
    this.nextStage = nextStage;

    this.label = label || '';

    this.val = (name && localStorage && localStorage.getItem(name)) || '';
    this.minlength = 0;
    this.maxWidth = maxWidth || 999;

    this.handleKeys = this.handleKeys.bind(this);
}

InputStage.prototype = {

    getInstruction: function() {
        return 'Start typing and press Enter when you’re done';
    },

    getShape: function() {
        var str = this.label + this.val;
        return XSS.font.shape(str, XSS.MENU_LEFT, XSS.MENU_TOP);
    },

    /**
     * @suppress {checkTypes} GCC expects this.val to be of another type
     */
    createStage: function() {
        XSS.on.keydown(this.handleKeys);
        this.input = new InputField(
            XSS.MENU_LEFT,
            XSS.MENU_TOP,
            this.label,
            this.maxWidth
        );
        this.input.callback = function(value) {
            delete XSS.shapes.stage; // We already show the dynamic stage
            this.val = value;
            if (localStorage) {
                localStorage.setItem(this.name, value);
            }
        }.bind(this);
        this.input.setValue(this.val);
    },

    destroyStage: function() {
        XSS.off.keydown(this.handleKeys);
        this.input.destruct();
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_ESCAPE:
                XSS.stageflow.previousStage();
                break;
            case XSS.KEY_ENTER:
                var val = this.val.trim();
                this.inputSubmit(this._getInputError(val), val);
        }
    },

    /**
     * @param {string} val
     * @return {string}
     * @private
     */
    _getInputError: function(val) {
        if (val.length < this.minlength) {
            return 'Too short!!!';
        } else {
            return '';
        }
    },

    /**
     * @param {string} error
     * @param {string} value
     */
    inputSubmit: function(error, value) {
        if (!error && value) {
            XSS.stageflow.switchStage(this.nextStage);
        }
    }

};


/**
 * BaseScreenStage
 * Stage with static content
 * @param {Shape} screen
 * @constructor
 * @implements {StageInterface}
 */
function ScreenStage(screen) {
    this._shape = screen;
}

ScreenStage.prototype = {

    getInstruction: function() {
        return 'Press Esc to go back to the futuuuuuuuuuuuuure';
    },

    getShape: function() {
        return this._shape;
    },

    createStage: function() {
        XSS.on.keydown(this.handleKeys);
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                XSS.stageflow.previousStage();
        }
    },

    destroyStage: function() {
        XSS.off.keydown(this.handleKeys);
        delete XSS.shapes.stage;
    }

};


/**
 * BaseSelectStage
 * Stage with a vertical select menu
 * @param {SelectMenu=} menu
 * @constructor
 * @implements {StageInterface}
 */
function SelectStage(menu) {
    this.menu = menu;
    this.handleKeys = this.handleKeys.bind(this);
}

SelectStage.prototype = {

    getInstruction: function() {
        return 'Use arrow keys to navigate and Enter to select.';
    },

    getShape: function() {
        return this.menu.getShape();
    },

    createStage: function() {
        XSS.on.keydown(this.handleKeys);
    },

    destroyStage: function() {
        XSS.off.keydown(this.handleKeys);
        delete XSS.shapes.stage;
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                XSS.stageflow.previousStage();
                break;
            case XSS.KEY_ENTER:
                var nextStage = this.menu.getNextStage();
                if (nextStage) {
                    XSS.stageflow.switchStage(nextStage);
                } else {
                    XSS.stageflow.previousStage();
                }
                break;
            case XSS.KEY_UP:
                this.menu.select(-1);
                XSS.stageflow.setStageShapes();
                break;
            case XSS.KEY_DOWN:
                this.menu.select(1);
                XSS.stageflow.setStageShapes();
        }
    }

};


/**
 * Game Stage
 * @constructor
 * @implements {StageInterface}
 */
function GameStage() {
}

GameStage.prototype = {

    getInstruction: function() {
        return '';
    },

    getShape: function() {
        return new Shape();
    },

    createStage: function() {
        var choices;
        delete XSS.shapes.header;

        choices = XSS.stageflow.getNamedChoices();
        XSS.socket = new Socket(function() {
            XSS.socket.emit(XSS.events.SERVER_ROOM_MATCH, choices);
        });
    },

    destroyStage: function() {
    }
};
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
            var title, active = (this.getSelected() === i);
            title = this._options[i].title;
            font = XSS.font.pixels(title, x, y, {invert: active});
            y += Font.LINE_HEIGHT + 1;
            shape.add(font);
        }

        // Help text line(s)
        desc = this.getSelectedOption().description;
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
 * @param {string|null} name
 * @param {Function} nextStage
 * @param {string} label
 * @constructor
 * @implements {StageInterface}
 */
function InputStage(name, nextStage, label) {
    this.name = name;
    this.nextStage = nextStage;
    this.label = label;

    this.val = Util.storage(name);
    this.minChars = 0;

    this._handleKeysBound = this.handleKeys.bind(this);
}

InputStage.prototype = {

    getInstruction: function() {
        return 'Start typing and submit using ' + XSS.UNICODE_ENTER_KEY + '.';
    },

    getShape: function() {
        var str = this.label + this.val;
        return XSS.font.shape(str, XSS.MENU_LEFT, XSS.MENU_TOP);
    },

    createStage: function() {
        XSS.on.keydown(this._handleKeysBound);
        this.input = new InputField(XSS.MENU_LEFT, XSS.MENU_TOP, this.label);
        this.input.setValue(this.val);
        this.input.maxWidth = this.maxWidth || this.input.maxWidth;
        this.input.callback = function(value) {
            this.val = value;
            Util.storage(this.name, value);
        }.bind(this);

        // Handled by InputField
        delete XSS.shapes.stage;
    },

    destroyStage: function() {
        XSS.off.keydown(this._handleKeysBound);
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
        return (val.length < this.minChars) ? 'Too short!!' : '';
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
        return 'Press Esc to go back.';
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
        return 'Navigate using arrow keys and select using ' + XSS.UNICODE_ENTER_KEY + '.';
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
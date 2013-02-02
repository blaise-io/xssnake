/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, Socket, InputField, Util, Font*/
'use strict';


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
    destructStage: function() {
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
        XSS.shapes.stage = null;
    },

    destructStage: function() {
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

    destructStage: function() {
        XSS.off.keydown(this.handleKeys);
        XSS.shapes.stage = null;
    }

};


/**
 * SelectStage
 * Stage with a vertical select menu
 * @param {SelectMenu} menu
 * @constructor
 * @implements {StageInterface}
 */
function SelectStage(menu) {
    this.menu = menu;
    this.handleKeysBound = this.handleKeys.bind(this);
}

SelectStage.prototype = {

    getInstruction: function() {
        return 'Navigate using arrow keys and select using ' + XSS.UNICODE_ENTER_KEY + '.';
    },

    getShape: function() {
        return this.menu.getShape();
    },

    createStage: function() {
        XSS.on.keydown(this.handleKeysBound);
    },

    destructStage: function() {
        XSS.off.keydown(this.handleKeysBound);
        XSS.shapes.stage = null;
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
 * Stage with a vertical form
 * @param {Form} form
 * @constructor
 * @implements {StageInterface}
 */
function FormStage(form) {
    this.form = form;
    this.handleKeysBound = this.handleKeys.bind(this);
}

FormStage.prototype = {

    getInstruction: function() {
        return '';
    },

    getShape: function() {
        return this.form.getShape();
    },

    createStage: function() {
        XSS.on.keydown(this.handleKeysBound);
    },

    destructStage: function() {
        XSS.off.keydown(this.handleKeysBound);
        XSS.shapes.stage = null;
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                XSS.stageflow.previousStage();
                break;
            case XSS.KEY_ENTER:
                break;
            case XSS.KEY_UP:
                this.form.selectField(-1);
                XSS.stageflow.setStageShapes();
                break;
            case XSS.KEY_DOWN:
                this.form.selectField(1);
                XSS.stageflow.setStageShapes();
                break;
            case XSS.KEY_LEFT:
                this.form.selectOption(-1);
                XSS.stageflow.setStageShapes();
                break;
            case XSS.KEY_RIGHT:
                this.form.selectOption(1);
                XSS.stageflow.setStageShapes();
                break;
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
        XSS.shapes.header = null;

        choices = XSS.stageflow.getNamedChoices();
        XSS.socket = new Socket(function() {
            XSS.socket.emit(XSS.events.SERVER_ROOM_MATCH, choices);
        });
    },

    destructStage: function() {
    }
};
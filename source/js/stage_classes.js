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
    createStage: function() {},

    /** @return */
    destructStage: function() {}

};


/**
 * BaseInputStage
 * Stage with a form input
 * @param {string|null} name
 * @param {Function} nextStage
 * @param {string} header
 * @param {string} label
 * @implements {StageInterface}
 * @constructor
 */
function InputStage(name, nextStage, header, label) {
    this.name = name;
    this.nextStage = nextStage;
    this.label = label;

    this.val = Util.storage(name);
    this.minChars = 0;

    this.inputTop = XSS.MENU_TOP + 17;

    this.header = this._headerStrToShape(header);
    this.headerAndValue = this._getHeaderAndValue();
    this.shape = this.headerAndValue;

    this._handleKeysBound = this.handleKeys.bind(this);
}

InputStage.prototype = {

    getInstruction: function() {
        return '';
    },

    getShape: function() {
        return this.shape;
    },

    createStage: function() {
        XSS.on.keydown(this._handleKeysBound);
        this.input = new InputField(XSS.MENU_LEFT, this.inputTop, this.label);
        this.input.setValue(this.val);
        this.input.maxWidth = this.maxWidth || this.input.maxWidth;
        this.input.callback = function(value) {
            this.val = value;
            Util.storage(this.name, value);
            this.shape = this.header;
        }.bind(this);

        // Input handled by InputField
        XSS.shapes.stage = this.header;
    },

    destructStage: function() {
        this.shape = this.headerAndValue;
        XSS.off.keydown(this._handleKeysBound);
        this.input.destruct();
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_ESCAPE:
                XSS.stageflow.previousStage();
                break;
            case XSS.KEY_ENTER:
                var val = this.val.trim(),
                    top = XSS.font.height(this.label) +
                        XSS.MENU_TOP +
                        XSS.SUBHEADER_HEIGHT +
                        -3;
                this.inputSubmit(this._getInputError(val), val, top);
        }
    },

    /**
     * @param {string} error
     * @param {string} value
     * @param {number} top
     */
    inputSubmit: function(error, value, top) {
        if (!error && value) {
            XSS.stageflow.switchStage(this.nextStage);
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
     * @param {string} str
     * @return {Shape}
     * @private
     */
    _headerStrToShape: function(str) {
        var pixels = XSS.font.pixels(str);
        pixels = XSS.transform.zoomX2(pixels, XSS.MENU_LEFT, XSS.MENU_TOP, true);
        return new Shape(pixels);
    },

    /**
     * @return {Shape}
     * @private
     */
    _getHeaderAndValue: function() {
        var shape, value = this.label + this.val;
        shape = new Shape(XSS.font.pixels(value, XSS.MENU_LEFT, this.inputTop));
        shape.add(this.header.pixels);
        return shape;
    }

};


/**
 * BaseScreenStage
 * Stage with static content
 * @param {Shape} screen
 * @implements {StageInterface}
 * @constructor
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
 * @implements {StageInterface}
 * @constructor
 */
function SelectStage(menu) {
    this.menu = menu;
    this.handleKeysBound = this.handleKeys.bind(this);
}

SelectStage.prototype = {

    getInstruction: function() {
        return '';
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
 * @implements {StageInterface}
 * @constructor
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
                var nextStage = this.form.getNextStage();
                XSS.stageflow.switchStage(nextStage);
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
 * @implements {StageInterface}
 * @constructor
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
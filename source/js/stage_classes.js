/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, Socket, InputField, Font, Room*/
'use strict';


/**
 * @interface
 */
function StageInterface() {}

StageInterface.prototype = {

    /** @return {Shape} */
    getShape: function() {
        return new Shape();
    },

    /** @return */
    construct: function() {},

    /** @return */
    destruct: function() {}

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

    this.val = XSS.util.storage(name);
    this.minChars = 0;
    this.maxChars = 0;

    this.maxValWidth = 0; // Passed to InputField
    this.displayWidth = 0;

    this.inputTop = XSS.MENU_TOP + 17;

    this.header = this._headerStrToShape(header);
    this.headerAndValue = this._getHeaderAndValue();
    this.shape = this.headerAndValue;

    this._handleKeysBound = this.handleKeys.bind(this);
}

InputStage.prototype = {

    getShape: function() {
        return this.shape;
    },

    construct: function() {
        XSS.on.keydown(this._handleKeysBound);

        this.input = new InputField(XSS.MENU_LEFT, this.inputTop, this.label);
        this.input.setValue(this.val);
        this.input.maxValWidth = this.maxValWidth || this.input.maxValWidth;
        this.input.displayWidth = this.displayWidth || this.input.displayWidth;

        this.input.callback = function(value) {
            this.val = value;
            XSS.util.storage(this.name, value);
            this.shape = this.header;
        }.bind(this);

        // Apply properties
        this.input.setValue(this.val);

        // Input handled by InputField
        XSS.shapes.stage = this.header;
    },

    destruct: function() {
        this.shape = this.headerAndValue;
        XSS.off.keydown(this._handleKeysBound);
        XSS.shapes.message = null;
        this.input.destruct();
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_ESCAPE:
                XSS.flow.previousStage();
                break;
            case XSS.KEY_ENTER:
                var val = this.val.trim(),
                    top = XSS.font.height(this.label) +
                        XSS.MENU_TOP +
                        XSS.MENU_TITLE_HEIGHT +
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
        if (!error && value && top) {
            XSS.flow.switchStage(this.nextStage);
        } else {
            var shape = XSS.font.shape(error, XSS.MENU_LEFT, top);
            shape.lifetime(0, 500);
            XSS.shapes.message = shape;
        }
    },

    /**
     * @param {string} val
     * @return {string}
     * @private
     */
    _getInputError: function(val) {
        if (val.length < this.minChars) {
            return 'Too short!!';
        } else if (this.maxChars && val.length > this.maxChars) {
            return 'Too long!!';
        }
        return '';
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

    getShape: function() {
        return this._shape;
    },

    construct: function() {
        XSS.on.keydown(this.handleKeys);
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                XSS.flow.previousStage();
        }
    },

    destruct: function() {
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

    getShape: function() {
        return this.menu.getShape();
    },

    construct: function() {
        XSS.on.keydown(this.handleKeysBound);
    },

    destruct: function() {
        XSS.off.keydown(this.handleKeysBound);
        XSS.shapes.stage = null;
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                XSS.flow.previousStage();
                break;
            case XSS.KEY_ENTER:
                var nextStage = this.menu.getNextStage();
                if (nextStage) {
                    XSS.flow.switchStage(nextStage);
                } else {
                    XSS.flow.previousStage();
                }
                break;
            case XSS.KEY_UP:
                this.menu.select(-1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
                break;
            case XSS.KEY_DOWN:
                this.menu.select(1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
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

    getShape: function() {
        return this.form.getShape();
    },

    construct: function() {
        XSS.on.keydown(this.handleKeysBound);
    },

    destruct: function() {
        XSS.off.keydown(this.handleKeysBound);
        XSS.shapes.stage = null;
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                XSS.flow.previousStage();
                break;
            case XSS.KEY_ENTER:
                var nextStage = this.form.getNextStage();
                XSS.flow.switchStage(nextStage);
                break;
            case XSS.KEY_UP:
                this.form.selectField(-1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
                break;
            case XSS.KEY_DOWN:
                this.form.selectField(1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
                break;
            case XSS.KEY_LEFT:
                this.form.selectOption(-1);
                XSS.play.menu_alt();
                XSS.flow.setStageShapes();
                break;
            case XSS.KEY_RIGHT:
                this.form.selectOption(1);
                XSS.play.menu_alt();
                XSS.flow.setStageShapes();
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

    getShape: function() {
        return new Shape();
    },

    construct: function() {
        XSS.menuSnake.destruct();
        XSS.shapes.header = null;

        if (XSS.stages.autoJoinData) {
            var room = XSS.util.hash(XSS.HASH_ROOM);
            this._autoJoin(room);
            delete XSS.stages.autoJoinData;
        } else {
            this._matchRoom();
        }
    },

    destruct: function() {
    },

    _autoJoin: function(key) {
        var stages = XSS.flow.stageInstances;

        XSS.pubsub.subscribe(XSS.PUB_ROOM_STATUS, XSS.PUB_NS_STAGES, function(data) {
            XSS.pubsub.unsubscribe(XSS.PUB_ROOM_STATUS, XSS.PUB_NS_STAGES);
            if (!data[0]) {
                XSS.util.error(Room.prototype.errorCodeToStr(data[1]));
            }
        });

        XSS.socket.emit(
            XSS.events.SERVER_ROOM_JOIN,
            [key, stages.autoJoin.val]
        );
    },

    _matchRoom: function() {
        var stages, data;

        stages = XSS.flow.stageInstances;
        data = stages.multiplayer.form.getValues();
        data[XSS.map.FIELD.NAME] = stages.inputName.val;

        XSS.socket = new Socket(function() {
            XSS.socket.emit(XSS.events.SERVER_ROOM_MATCH, data);
        });
    }

};
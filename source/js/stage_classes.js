/*jshint globalstrict:true*/
/*globals XSS, Shape, Socket, Utils*/

'use strict';

/**
 * SelectMenu
 * Creates a single navigatable verticle menu
 * @param {string} name
 * @constructor
 */
function SelectMenu(name) {
    this.opts = [];
    this.name = name;
}

SelectMenu.prototype = {

    /**
     * @param {?(boolean|string)} value
     * @param {string} next
     * @param {string} title
     * @param {string} description
     */
    addOption: function(value, next, title, description) {
        this.opts.push({
            value      : value,
            next       : next,
            title      : title,
            description: description
        });
    },

    getNextStage: function(index) {
        return this.opts[index].next;
    },

    getShape: function() {
        this._normalizeSelectedOption();
        return this._generateShape();
    },

    _normalizeSelectedOption: function() {
        var name = this.name,
            options = this.opts;

        if (typeof XSS.stages.choices[name] === 'undefined') {
            XSS.stages.choices[name] = 0;
        } else if (XSS.stages.choices[name] < 0) {
            XSS.stages.choices[name] = options.length - 1;
        } else if (XSS.stages.choices[name] > options.length - 1) {
            XSS.stages.choices[name] = 0;
        }
    },

    _generateShape: function() {
        var x, y, shape, options, selected, description;

        x = XSS.MENU_LEFT;
        y = XSS.MENU_TOP;

        shape = new Shape();
        options = this.opts;
        selected = XSS.stages.choices[this.name] || 0;
        description = options[selected] ? options[selected].description : '';

        // Option
        for (var i = 0, m = options.length; i < m; i++) {
            shape.add(
                XSS.font.draw(x, y + (i * 9), options[i].title, (selected === i))
            );
        }

        // Help text line(s)
        if (description) {
            if (typeof description === 'string') {
                description = [description];
            }
            for (var j = 0, n = description.length; j < n; j++) {
                shape.add(
                    XSS.font.draw(x, y + ((i + 1 + j) * 9), description[j])
                );
            }
        }

        return shape;
    }

};


/**
 * @interface
 */
function Stage(name) {
    this.name = name;
}

Stage.prototype = {

    getInstruction: function() {},
    getShape      : function() {},
    createStage   : function() {},
    destroyStage  : function() {}

};


/**
 * BaseInputStage
 * Stage with a form input
 * @param {string} name
 * @constructor
 * @implements {Stage}
 */
function InputStage(name, nextStage) {
    this.name = name;
    this.nextStage = nextStage;

    this.defaultVal = '';

    this.minlength = 0;
    this.maxlength = 150;

    this.label = '';
    this.labelWsp = 2;

    this.handleKeys = this.handleKeys.bind(this);
    this.inputUpdate = this.inputUpdate.bind(this);
}

InputStage.prototype = {

    setLabel: function(label) {
        this.label = label;
        this.labelWidth = XSS.font.width(label) + this.labelWsp;
    },

    getInstruction: function() {
        return 'Start typing and press Enter when you’re done';
    },

    getShape: function() {
        var left = XSS.MENU_LEFT + this.labelWidth + this.labelWsp;
        return new Shape(
            XSS.font.draw(XSS.MENU_LEFT, XSS.MENU_TOP, this.label),
            XSS.font.draw(left, XSS.MENU_TOP, this.getInputvalue())
        );
    },

    createStage: function() {
        XSS.on.keydown(this.handleKeys);
        XSS.on.keydown(this.inputUpdate);
        XSS.on.keyup(this.inputUpdate);
        XSS.input.focus();

        XSS.input.value = '';
        XSS.input.value = this.getInputvalue(); // Places caret at end
        XSS.input.setAttribute('maxlength', this.maxlength);

        this.inputUpdate();
    },

    destroyStage: function() {
        XSS.off.keydown(this.handleKeys);
        XSS.off.keydown(this.inputUpdate);
        XSS.off.keyup(this.inputUpdate);

        delete XSS.shapes.ermsg;
        delete XSS.shapes.caret;
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_ESCAPE:
                XSS.menu.goToPreviousStage();
                break;
            case XSS.KEY_ENTER:
                this.inputSubmit();
        }
    },

    getInputvalue: function() {
        return XSS.input.value || XSS.stages.choices[this.name] || this.defaultVal;
    },

    /** @private */
    getInputError: function(val) {
        if (val.length < this.minlength) {
            return 'Too short!!!';
        } else if (val.length > this.maxlength) {
            return 'Too long!!!';
        } else {
            return false;
        }
    },

    /** @private */
    inputSubmit: function() {
        var value, error, errfont;

        value = this.getInputvalue();
        error = this.getInputError(value);

        if (error === false) {
            XSS.menu.switchStage(this.name, this.nextStage);
            XSS.stages.choices[this.name] = value;
        } else {
            errfont = XSS.font.draw(XSS.MENU_LEFT, XSS.MENU_TOP + 9, error);
            XSS.shapes.ermsg = new Shape(errfont).lifetime(0, 500);
        }

        return false;
    },

    /** @private */
    inputUpdate: function() {
        var fontWidth, caretLeft, caret, value, strTilCaret;

        // Selected text: too much hassle
        if (XSS.input.selectionStart !== XSS.input.selectionEnd) {
            XSS.input.selectionStart = XSS.input.selectionEnd;
        }

        value = this.getInputvalue();
        strTilCaret = value.substr(0, XSS.input.selectionStart);

        fontWidth = XSS.font.width(strTilCaret) || -1;
        caretLeft = XSS.MENU_LEFT + this.labelWidth + this.labelWsp + fontWidth;

        caret = XSS.shapes.line(
            caretLeft, XSS.MENU_TOP - 1,
            caretLeft, XSS.MENU_TOP + 6
        );

        XSS.shapes.caret = caret.flash();
        XSS.menu.refreshStage();
    }

};


/**
 * BaseScreenStage
 * Stage with static content
 * @param {string} name
 * @constructor
 * @implements {Stage}
 */
function ScreenStage(name, screen) {
    this.name = name;
    this._shape = screen || [];
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
                XSS.menu.goToPreviousStage();
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
 * @param {string} name
 * @param {SelectMenu=} menu
 * @constructor
 * @implements {Stage}
 */
function SelectStage(name, menu) {
    this.name = name;
    this.menu = menu || new SelectMenu(name);
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
        XSS.stages.choices[this.name] = XSS.stages.choices[this.name] || 0;
        XSS.on.keydown(this.handleKeys);
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                XSS.menu.goToPreviousStage();
                break;
            case XSS.KEY_ENTER:
                var nextStage = this.menu.getNextStage(XSS.stages.choices[this.name]);
                XSS.menu.switchStage(XSS.stages.current, nextStage);
                break;
            case XSS.KEY_UP:
                XSS.stages.choices[this.name] -= 1;
                XSS.menu.refreshStage();
                break;
            case XSS.KEY_DOWN:
                XSS.stages.choices[this.name] += 1;
                XSS.menu.refreshStage();
        }
    },

    destroyStage: function() {
        XSS.off.keydown(this.handleKeys);
        delete XSS.shapes.stage;
    }

};


/**
 * Game Stage
 * @param {string} name
 * @constructor
 * @implements {Stage}
 */
function GameStage(name) {
    this.name = name;
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

        choices = XSS.stages.getNamedChoices();

        XSS.socket = new Socket(function() {
            XSS.socket.emit(XSS.events.SERVER_ROOM_MATCH, choices);
        });
    },

    destroyStage: function() {
    }
};


/**
 * Menu instantiation, stage switching
 * @constructor
 */
function Menu() {}

Menu.prototype = {

    setStages: function(stages) {
        this.stages = stages;
    },

    newStage: function(name) {
        var stage = this.stages[name];

        XSS.shapes.instruction = new Shape(
            XSS.font.draw(XSS.MENU_LEFT, 45, stage.getInstruction())
        );

        this.updateStage(stage);
        stage.createStage();
    },

    switchStage: function(currentStageName, newStageName, options) {
        var onAnimateDone = function() {

            // Remove old stages
            delete XSS.shapes.oldstage;
            delete XSS.shapes.newstage;

            // Load new stage
            XSS.stages.current = newStageName;
            this.newStage(newStageName);

            // Log course
            if (options && options.back) {
                XSS.stages.course.pop();
            } else {
                XSS.stages.course.push(newStageName);
            }
        };

        if (!this.stages[newStageName]) {
            throw new Error(newStageName);
        }

        // Unload old stage
        this.stages[currentStageName].destroyStage();

        delete XSS.shapes.instruction;
        delete XSS.shapes.stage;

        this._switchStageAnimate(
            this.stages[currentStageName].getShape(),
            this.stages[newStageName].getShape(),
            (options && options.back),
            onAnimateDone.bind(this)
        );
    },

    goToPreviousStage: function() {
        var previousStageName,
            courseLength = XSS.stages.course.length;
        if (courseLength > 1) {
            previousStageName = XSS.stages.course[courseLength - 2];
            this.switchStage(XSS.stages.current, previousStageName, {back: true});
        }
    },

    setupMenuSkeletton: function() {
        XSS.shapes.border = XSS.shapes.outerBorder();
        XSS.shapes.header = XSS.shapes.header(XSS.MENU_LEFT);
    },

    updateStage: function(stage) {
        XSS.shapes.stage = stage.getShape();
    },

    refreshStage: function() {
        this.updateStage(this.stages[XSS.stages.current]);
    },

    /**
     * @param {Shape} oldStage
     * @param {Shape} newStage
     * @param {boolean} back
     * @param {function()} callback
     * @private
     */
    _switchStageAnimate: function(oldStage, newStage, back, callback) {
        var oldStageAnim, newStageAnim,
            width = XSS.PIXELS_H;

        if (back) {
            oldStageAnim = {start: 0, end: width};
            newStageAnim = {start: -width, end: 0};
        } else {
            oldStageAnim = {start: 0, end: -width};
            newStageAnim = {start: width, end: 0};
        }

        newStageAnim.callback = callback;

        XSS.shapes.oldstage = oldStage.clone().dynamic(true).swipe(oldStageAnim);
        XSS.shapes.newstage = newStage.clone().dynamic(true).swipe(newStageAnim);
    }

};
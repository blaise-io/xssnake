/*jshint globalstrict:true*/
/*globals XSS, PixelEntity, Socket, Utils*/

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

    getEntity: function() {
        this._normalizeSelectedOption();
        return this._generateEntity();
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

    _generateEntity: function() {
        var x, y, entity, options, selected, description;

        x = XSS.MENU_LEFT;
        y = XSS.MENU_TOP;
        entity = new PixelEntity();
        options = this.opts;
        selected = XSS.stages.choices[this.name] || 0;
        description = options[selected] ? options[selected].description : '';

        // Option
        for (var i = 0, m = options.length; i < m; i++) {
            entity.add(
                XSS.font.draw(x, y + (i * 9), options[i].title, (selected === i))
            );
        }

        // Help text line(s)
        if (description) {
            if (typeof description === 'string') {
                description = [description];
            }
            for (var j = 0, n = description.length; j < n; j++) {
                entity.add(
                    XSS.font.draw(x, y + ((i + 1 + j) * 9), description[j])
                );
            }
        }

        return entity;
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
    getEntity     : function() {},
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

    this.defaultValue = '';

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

    getEntity: function() {
        var left = XSS.MENU_LEFT + this.labelWidth + this.labelWsp;
        return new PixelEntity(
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

        XSS.effects.blinkStop('caret');
        XSS.effects.decayStop('error');
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
        return XSS.input.value || XSS.stages.choices[this.name] || this.defaultValue;
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
        var value, error, message;

        value = this.getInputvalue();
        error = this.getInputError(value);

        if (error === false) {
            XSS.menu.switchStage(this.name, this.nextStage);
            XSS.stages.choices[this.name] = value;
        } else {
            message = new PixelEntity(
                XSS.font.draw(XSS.MENU_LEFT, XSS.MENU_TOP + 9, error)
            );
            XSS.effects.decay('error', message);
        }

        return false;
    },

    /** @private */
    inputUpdate: function() {
        var crateText, caretLeft, caret, value, valuePixelWidth;

        // Selected text: too much hassle
        if (XSS.input.selectionStart !== XSS.input.selectionEnd) {
            XSS.input.selectionStart = XSS.input.selectionEnd;
        }

        value = this.getInputvalue();
        valuePixelWidth = value.substr(0, XSS.input.selectionStart);

        crateText = XSS.font.width(valuePixelWidth) || -1;
        caretLeft = XSS.MENU_LEFT + this.labelWidth + this.labelWsp + crateText;

        caret = XSS.drawables.line(
            caretLeft, XSS.MENU_TOP - 1,
            caretLeft, XSS.MENU_TOP + 6
        );

        XSS.effects.blinkStop('caret');
        XSS.effects.blink('caret', caret);
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
    this.entity = screen || [];
}

ScreenStage.prototype = {

    getInstruction: function() {
        return 'Press Esc to go back to the futuuuuuuuuuuuuure';
    },

    getEntity: function() {
        return this.entity;
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
        delete XSS.ents.stage;
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

    getEntity: function() {
        return this.menu.getEntity();
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
        delete XSS.ents.stage;
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

    getEntity: function() {
        return new PixelEntity();
    },

    createStage: function() {
        var choices;
        delete XSS.ents.header;

        choices = XSS.stages.getNamedChoices();

        XSS.socket = new Socket(function() {
            XSS.socket.emit('/server/room/match/get', choices);
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

        XSS.ents.instruction = new PixelEntity(
            XSS.font.draw(XSS.MENU_LEFT, 45, stage.getInstruction())
        );

        this.updateStage(stage);
        stage.createStage();
    },

    switchStage: function(currentStageName, newStageName, options) {
        var onAnimateDone = function() {
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

        delete XSS.ents.instruction;
        delete XSS.ents.stage;

        this._switchStageAnimate(
            this.stages[currentStageName].getEntity(),
            this.stages[newStageName].getEntity(),
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
        XSS.ents.border = XSS.drawables.outerBorder();
        XSS.ents.header = XSS.drawables.header(XSS.MENU_LEFT);
    },

    updateStage: function(stage) {
        XSS.ents.stage = stage.getEntity();
    },

    refreshStage: function() {
        this.updateStage(this.stages[XSS.stages.current]);
    },

    /** @private */
    _switchStageAnimate: function(oldStagePixels, newStagePixels, back, callback) {
        var oldStagePixelsAnim, newStagePixelsAnim,
            width = XSS.PIXELS_H;

        if (back) {
            oldStagePixelsAnim = {start: 0, end: width};
            newStagePixelsAnim = {start: -width, end: 0};
        } else {
            oldStagePixelsAnim = {start: 0, end: -width};
            newStagePixelsAnim = {start: width, end: 0};
        }

        newStagePixelsAnim.callback = callback;

        XSS.effects.swipe('oldstage', oldStagePixels, oldStagePixelsAnim);
        XSS.effects.swipe('newstage', newStagePixels, newStagePixelsAnim);
    }

};
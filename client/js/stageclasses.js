/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

/**
 * SelectMenu
 * Creates a single navigatable verticle menu
 * @param name
 * @constructor
 */
function SelectMenu(name) {
    this.options = [];
    this.name = name;
}

SelectMenu.prototype = {

    addOption: function(value, title, description, settings) {
        this.options.push({
            value      : value,
            title      : title,
            description: description,
            settings   : settings || {}
        });
    },

    getOptionNextStage: function(index) {
        return this.options[index].settings.nextStage || this.options[index].value;
    },

    getPixels: function() {
        var name = this.name,
            options = this.options;

        if (typeof XSS.stages.choices[name] === 'undefined') {
            XSS.stages.choices[name] = 0;
        } else if (XSS.stages.choices[name] < 0) {
            XSS.stages.choices[name] = options.length - 1;
        } else if (XSS.stages.choices[name] > options.length - 1) {
            XSS.stages.choices[name] = 0;
        }

        var settings = {
            selected: XSS.stages.choices[name],
            options : options
        };

        return XSS.drawables.getMenuPixels(name, XSS.MENU_LEFT, XSS.MENU_TOP, settings);
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
    getPixels     : function() {},
    createStage   : function() {},
    destroyStage  : function() {}

};


/**
 * BaseInputStage
 * Stage with a form input
 * @param name
 * @constructor
 * @implements {Stage}
 */
function InputStage(name, nextStage) {
    this.name = name;
    this.nextStage = nextStage;

    this.val = '';
    this.defaultValue = '';

    this.minlength = 0;
    this.maxlength = 150;

    this.label = '';
    this.labelWsp = this.labelWidth = 2;

    this.inputEvents = ['keydown.' + this.name, 'keyup.' + this.name].join(' ');
}

InputStage.prototype = {

    setLabel: function(label) {
        this.label = label;
        this.labelWidth = XSS.font.getLength(label) + this.labelWsp;
    },

    getInstruction: function() {
        return 'Start typing and press Enter when you’re done';
    },

    getPixels: function() {
        return [].concat(
            XSS.font.write(XSS.MENU_LEFT, XSS.MENU_TOP, this.label),
            XSS.font.write(XSS.MENU_LEFT + this.labelWidth + this.labelWsp, XSS.MENU_TOP, this.getInputvalue())
        );
    },

    createStage: function() {
        XSS.input.on(this.inputEvents, this.inputUpdate.bind(this));
        XSS.input.trigger('focus').trigger('keyup');
        XSS.input.val('').val(this.getInputvalue()); // Places caret at end
        XSS.input.attr('maxlength', this.maxlength);
        XSS.doc.on('keydown.inputstage', this.handleKeys.bind(this));
    },

    destroyStage: function() {
        XSS.input.off(this.inputEvents);
        XSS.input.val('');

        XSS.doc.off('keydown.inputstage');

        XSS.effects.blinkStop('caret');
        XSS.effects.decayNow('error');
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
        return XSS.input.val() || XSS.stages.choices[this.name] || this.defaultValue;
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
        var value, error;

        value = $.trim(this.getInputvalue());
        error = this.getInputError(value);

        if (error === false) {
            XSS.menu.switchStage(this.name, this.nextStage);
            XSS.stages.choices[this.name] = value;
        } else {
            XSS.effects.decay('error', XSS.font.write(XSS.MENU_LEFT, XSS.MENU_TOP + 9, error));
        }

        return false;
    },

    /** @private */
    inputUpdate: function() {
        var caretTextPos, caretGlobPos, caret, value;

        // Selected text: too much hassle
        if (XSS.input[0].selectionStart !== XSS.input[0].selectionEnd) {
            XSS.input[0].selectionStart = XSS.input[0].selectionEnd;
        }

        value = this.getInputvalue();

        caretTextPos = XSS.font.getLength(value.substr(0, XSS.input[0].selectionStart));
        caretTextPos = caretTextPos || -1;

        caretGlobPos = XSS.MENU_LEFT + this.labelWidth + this.labelWsp + caretTextPos;

        caret = XSS.drawables.line(caretGlobPos, XSS.MENU_TOP - 1, caretGlobPos, XSS.MENU_TOP + 6);

        XSS.effects.blink('caret', caret);
        XSS.menu.refreshStage();
    }
};


/**
 * BaseScreenStage
 * Stage with static content
 * @param name
 * @constructor
 * @implements {Stage}
 */
function ScreenStage(name) {
    this.name = name;
    this.screen = [];
}

ScreenStage.prototype = {

    getInstruction: function() {
        return 'Press Esc to go back to the futuuuuuuuuuuuuure';
    },

    getPixels: function() {
        return this.screen;
    },

    createStage: function() {
        XSS.doc.on('keydown.screenstage', this.handleKeys);
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                XSS.menu.goToPreviousStage();
        }
    },

    destroyStage: function() {
        XSS.doc.off('keydown.screenstage');
        delete XSS.canvas.objects.stage;
    }

};


/**
 * BaseSelectStage
 * Stage with a vertical select menu
 * @param name
 * @constructor
 * @implements {Stage}
 */
function SelectStage(name) {
    this.name   = name;
    this.map    = {};
    this.menu   = new SelectMenu(name);
}

SelectStage.prototype = {

    getInstruction: function() {
        return 'Use arrow keys to navigate and Enter to select.';
    },

    getPixels: function() {
        return this.menu.getPixels();
    },

    createStage: function() {
        XSS.stages.choices[this.name] = XSS.stages.choices[this.name] || 0;
        XSS.doc.on('keydown.selectstage', this.handleKeys.bind(this));
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_BACKSPACE:
            case XSS.KEY_ESCAPE:
                XSS.menu.goToPreviousStage();
                break;
            case XSS.KEY_ENTER:
                var nextStage = this.menu.getOptionNextStage(XSS.stages.choices[this.name]);
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
        XSS.doc.off('keydown.selectstage');
        delete XSS.canvas.objects.stage;
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

    newStage: function(stageName) {
        var stage = this.stages[stageName];

        XSS.canvas.objects.instruction = {
            pixels: XSS.font.write(XSS.MENU_LEFT, 45, stage.getInstruction())
        };

        this.updateStage(stage);
        stage.createStage();
    },

    switchStage: function(currentStageName, newStageName, options) {
        var onAnimateDone = function() {
            // Load new stage
            XSS.stages.current = newStageName;
            this.newStage(newStageName);

            // Log history
            if (options && options.back) {
                XSS.stages.history.pop();
            } else {
                XSS.stages.history.push(newStageName);
            }
        };

        if (!this.stages[newStageName]) {
            throw new Error('Stage does not exist: ' + newStageName);
        }

        // Unload old stage
        this.stages[currentStageName].destroyStage();

        delete XSS.canvas.objects.instruction;
        delete XSS.canvas.objects.stage;

        this.animateSwitchStage(
            this.stages[currentStageName].getPixels(),
            this.stages[newStageName].getPixels(),
            (options && options.back),
            onAnimateDone.bind(this)
        );
    },

    goToPreviousStage: function() {
        var previousStageName,
            historyLength = XSS.stages.history.length;
        if (historyLength > 1) {
            previousStageName = XSS.stages.history[historyLength - 2];
            this.switchStage(XSS.stages.current, previousStageName, {back: true});
        }
    },

    setupMenuSkeletton: function() {
        XSS.canvas.objects.border = {
            pixels: XSS.drawables.getOuterBorderPixels()
        };

        XSS.canvas.objects.header = {
            pixels: XSS.drawables.getHeaderPixels(XSS.MENU_LEFT)
        };
    },

    /** @private */
    refreshStage: function() {
        this.updateStage(this.stages[XSS.stages.current]);
    },

    /** @private */
    updateStage: function(stage) {
        XSS.canvas.objects.stage = {
            pixels: stage.getPixels()
        };
    },

    /** @private */
    animateSwitchStage: function(oldStagePixels, newStagePixels, back, callback) {
        var oldStagePixelsAnim, newStagePixelsAnim,
            width = XSS.PIXELS_H;

        if (back) {
            oldStagePixelsAnim = {start: 0, end: width};
            newStagePixelsAnim = {start: -width, end: 0};
        } else {
            oldStagePixelsAnim = {start: 0, end: -width};
            newStagePixelsAnim = {start: width, end: 0};
        }

        $.extend(newStagePixelsAnim, {callback: callback});

        XSS.effects.swipe('oldstage', oldStagePixels, oldStagePixelsAnim);
        XSS.effects.swipe('newstage', newStagePixels, newStagePixelsAnim);
    }

};
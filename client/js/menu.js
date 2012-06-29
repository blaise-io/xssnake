/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

/** @const */
XSS.MENULEFT = 40;

/** @const */
XSS.MENUTOP = 64;

XSS.menuChoices = {};

XSS.currentStageName = 'main';

XSS.menuHistory = [XSS.currentStageName];

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

    addOption: function(value, title, description) {
        this.options.push({
            value      : value,
            title      : title,
            description: description
        });
    },

    getOptionByIndex: function(index) {
        return this.options[index];
    },

    getPixels: function() {
        var name = this.name,
            options = this.options;

        if (typeof XSS.menuChoices[name] === 'undefined') {
            XSS.menuChoices[name] = 0;
        } else if (XSS.menuChoices[name] < 0) {
            XSS.menuChoices[name] = options.length - 1;
        } else if (XSS.menuChoices[name] > options.length - 1) {
            XSS.menuChoices[name] = 0;
        }

        var settings = {
            selected: XSS.menuChoices[name],
            options : options
        };

        return XSS.drawables.getMenuPixels(name, XSS.MENULEFT, XSS.MENUTOP, settings);
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
function BaseInputStage(name) {
    this.name = name;
    this.val = '';
    this.minlength = 0;
    this.maxlength = 150;
    this.defaultValue = '';
    this.label = '';
    this.labelWsp = this.labelWidth = 2;
    this.enterEvent = '/xss/key/enter.' + this.name;
    this.backEvent = '/xss/key/escape.' + name;
    this.inputEvents = ['keydown.' + this.name, 'keyup.' + this.name].join(' ');
}

BaseInputStage.prototype = {

    setLabel: function(label) {
        this.label = label;
        this.labelWidth = XSS.font.getLength(label) + this.labelWsp;
    },

    getInstruction: function() {
        return 'Start typing and press Enter when you’re done';
    },

    getPixels: function() {
        return [].concat(
            XSS.font.write(XSS.MENULEFT, XSS.MENUTOP, this.label),
            XSS.font.write(XSS.MENULEFT + this.labelWidth + this.labelWsp, XSS.MENUTOP, this.val)
        );
    },

    createStage: function() {
        XSS.input.on(this.inputEvents, this.inputUpdate.bind(this));
        XSS.input.trigger('focus').trigger('keyup');
        XSS.input.attr('maxlength', this.maxlength);

        XSS.doc.on(this.enterEvent, this.inputSubmit.bind(this));
        XSS.doc.on(this.backEvent, function() {
            XSS.menu.goToPreviousStage();
        });
    },

    destroyStage: function() {
        XSS.input.off(this.inputEvents);
        XSS.input.removeAttr('maxlength');

        XSS.doc.off(this.enterEvent);
        XSS.doc.off(this.backEvent);

        XSS.effects.blinkStop('caret');
        XSS.effects.decayNow('error');
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

        value = $.trim(XSS.input.val());
        error = this.getInputError(value);

        if (error === false) {
            XSS.menu.switchStage(this.name, 'type');
            XSS.menuChoices[this.name] = value;
        } else {
            XSS.effects.decay('error', XSS.font.write(XSS.MENULEFT, XSS.MENUTOP + 9, error));
        }

        return false;
    },

    /** @private */
    inputUpdate: function() {
        var caretTextPos, caretGlobPos, caret;

        // Selected text: too much hassle
        if (XSS.input[0].selectionStart !== XSS.input[0].selectionEnd) {
            XSS.input[0].selectionStart = XSS.input[0].selectionEnd;
        }

        this.val = XSS.input.val();

        caretTextPos = XSS.font.getLength(this.val.substr(0, XSS.input[0].selectionStart));
        caretTextPos = caretTextPos || -1;

        caretGlobPos = XSS.MENULEFT + this.labelWidth + this.labelWsp + caretTextPos;

        caret = XSS.drawables.line(caretGlobPos, XSS.MENUTOP - 1, caretGlobPos, XSS.MENUTOP + 6);

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
function BaseScreenStage(name) {
    this.name = name;
    this.screen = [];
    this.backEvent = ['/xss/key/escape.' + name, '/xss/key/backspace.' + name].join(' ');
}

BaseScreenStage.prototype = {

    getInstruction: function() {
        return 'Press Esc to go back to the futuuuuuuuuuuuuure';
    },

    getPixels: function() {
        return this.screen;
    },

    createStage: function() {
        XSS.doc.on(this.backEvent, function() {
            XSS.menu.goToPreviousStage();
        });
    },

    destroyStage: function() {
        XSS.doc.off(this.backEvent);
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
function BaseSelectStage(name) {
    this.name = name;
    this.menu = new SelectMenu(name);
    this.events = {
        up    : '/xss/key/up.' + name,
        down  : '/xss/key/down.' + name,
        select: '/xss/key/enter.' + name,
        back  : ['/xss/key/escape.' + name, '/xss/key/backspace.' + name].join(' ')
    };
}

BaseSelectStage.prototype = {

    getInstruction: function() {
        return 'Use arrow keys to navigate and Enter to select.';
    },

    getPixels: function() {
        return this.menu.getPixels();
    },

    createStage: function() {
        XSS.menuChoices[this.name] = XSS.menuChoices[this.name] || 0;

        XSS.doc.on(this.events.down, function() {
            XSS.menuChoices[this.name] += 1;
            XSS.menu.refreshStage();
        }.bind(this));

        XSS.doc.on(this.events.up, function() {
            XSS.menuChoices[this.name] -= 1;
            XSS.menu.refreshStage();
        }.bind(this));

        XSS.doc.on(this.events.select, function() {
            var option = this.menu.getOptionByIndex(XSS.menuChoices[this.name]);
            XSS.menu.switchStage(XSS.currentStageName, option.value);
        }.bind(this));

        XSS.doc.on(this.events.back, function() {
            XSS.menu.goToPreviousStage();
        });
    },

    destroyStage: function() {
        XSS.doc.off([this.events.down, this.events.up, this.events.select, this.events.back].join(' '));
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
            pixels: XSS.font.write(XSS.MENULEFT, 45, stage.getInstruction())
        };

        this.updateStage(stage);
        stage.createStage();
    },

    switchStage: function(currentStageName, newStageName, options) {
        var onAnimateDone = function() {
            // Load new stage
            XSS.currentStageName = newStageName;
            this.newStage(newStageName);

            // Log history
            if (options && options.back) {
                XSS.menuHistory.pop();
            } else {
                XSS.menuHistory.push(newStageName);
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
            historyLength = XSS.menuHistory.length;
        if (historyLength > 1) {
            previousStageName = XSS.menuHistory[historyLength - 2];
            this.switchStage(XSS.currentStageName, previousStageName, {back: true});
        }
    },

    setupMenuSkeletton: function() {
        XSS.canvas.objects.border = {
            pixels: XSS.drawables.getOuterBorderPixels()
        };

        XSS.canvas.objects.header = {
            pixels: XSS.drawables.getHeaderPixels(XSS.MENULEFT)
        };
    },

    /** @private */
    refreshStage: function() {
        this.updateStage(this.stages[XSS.currentStageName]);
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
            width = XSS.HPIXELS;

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
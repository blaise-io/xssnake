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
    this.name = name;
    this.selected = 0;
    this._options = [];
}

SelectMenu.prototype = {

    /**
     * @param {?(boolean|string)} value
     * @param {function()} next
     * @param {string} title
     * @param {string} description
     */
    addOption: function(value, next, title, description) {
        this._options.push({
            value      : value,
            next       : next,
            title      : title,
            description: description
        });
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
        var x, y, description, font, shape;

        x = XSS.MENU_LEFT;
        y = XSS.MENU_TOP;

        shape = new Shape();

        // Draw options
        for (var i = 0, m = this._options.length; i < m; i++) {
            var active, title;
            active = (this.getSelected() === i);
            title = this._options[i].title;
            font = XSS.font.pixels(x, y + (i * 9), title, active);
            shape.add(font);
        }

        // Help text line(s)
        description = this.getSelectedOption().description.split('\n');
        for (var j = 0, n = description.length; j < n; j++) {
            font = XSS.font.pixels(x, y + ((i + 1 + j) * 9), description[j]);
            shape.add(font);
        }

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
 * @constructor
 * @implements {StageInterface}
 */
function InputStage(name, nextStage) {
    this.name = name;
    this.nextStage = nextStage;

    this.value = '';
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

    getShape: function() {
        var left = XSS.MENU_LEFT + this.labelWidth + this.labelWsp;
        return new Shape(
            XSS.font.pixels(XSS.MENU_LEFT, XSS.MENU_TOP, this.label),
            XSS.font.pixels(left, XSS.MENU_TOP, this.value)
        );
    },

    createStage: function() {
        XSS.on.keydown(this.handleKeys);
        XSS.on.keydown(this.inputUpdate);
        XSS.on.keyup(this.inputUpdate);
        XSS.input.focus();

        XSS.input.value = ''; // Emptying first places caret at end
        XSS.input.value = this.value || this.defaultValue;

        XSS.input.setAttribute('maxlength', '' + this.maxlength);

        this.inputUpdate();
    },

    destroyStage: function() {
        XSS.off.keydown(this.handleKeys);
        XSS.off.keydown(this.inputUpdate);
        XSS.off.keyup(this.inputUpdate);

        delete XSS.shapes.message;
        delete XSS.shapes.caret;
    },

    handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_ESCAPE:
                XSS.stageflow.previousStage();
                break;
            case XSS.KEY_ENTER:
                this.inputSubmit();
        }
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
        var error, shape, text, duration = 500;

        error = this.getInputError(this.value.trim());

        if (error === false) {
            this.value = this.value.trim();
            text = this._getRandomRemarkOnNameROFL(this.value);
            duration = Math.max(text.length * 40, 500);
            window.setTimeout(function() {
                XSS.stageflow.switchStage(this.nextStage);
            }.bind(this), duration + 50);
        } else {
            text = error;
        }

        shape = XSS.font.shape(XSS.MENU_LEFT, XSS.MENU_TOP + 9, text);
        shape.lifetime(0, duration);
        XSS.shapes.message = shape;

        return false;
    },

    /** @private */
    inputUpdate: function() {
        var fontWidth, caretLeft, caret, strTilCaret;

        // Selected text: too much hassle
        if (XSS.input.selectionStart !== XSS.input.selectionEnd) {
            XSS.input.selectionStart = XSS.input.selectionEnd;
        }

        this.value = XSS.input.value;
        strTilCaret = this.value.substr(0, XSS.input.selectionStart);

        fontWidth = XSS.font.width(strTilCaret) || -1;
        caretLeft = XSS.MENU_LEFT + this.labelWidth + this.labelWsp + fontWidth;

        caret = XSS.shapegen.lineShape(
            caretLeft, XSS.MENU_TOP - 1,
            caretLeft, XSS.MENU_TOP + 6
        );

        XSS.shapes.caret = caret.flash();
        XSS.stageflow.setStageShapes();
    },

    // TODO: Remove from this generic class
    _getRandomRemarkOnNameROFL: function(name) {
        var remark, collection = [
            '%s%s%s',
            'You have the same name as my mom',
            'LOVELY ♥♥♥',
            '☠',
            'Sorry, but that is the lamest name EVER',
            'Clever name!',
            'I ♥ the way you touch your keyboard',
            'asdasdasdasd',
            'Please dont touch anything',
            'Hello %s',
            'Is that your real name?',
            'You dont look like a %s...',
            'Are you new here?',
            'I remember you',
            'You smell NICE! ;-)',
            'Can I have your number?',
            'My name is NaN',
            'I thought I banned you?',
            'RECYCLING SAVES THE EARTH!!!',
            'OMGOMG'
        ];
        remark = collection[Math.floor(Math.random() * (collection.length))];
        while (remark.match('%s')) {
            remark = remark.replace('%s', name);
        }
        return remark;
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
                XSS.stageflow.switchStage(this.menu.getNextStage());
                break;
            case XSS.KEY_UP:
                this.menu.selected--;
                XSS.stageflow.setStageShapes();
                break;
            case XSS.KEY_DOWN:
                this.menu.selected++;
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
        console.log(choices);

//        XSS.socket = new Socket(function() {
//            XSS.socket.emit(XSS.events.SERVER_ROOM_MATCH, choices);
//        });
    },

    destroyStage: function() {
    }
};
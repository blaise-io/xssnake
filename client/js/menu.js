/*globals XSS*/

XSS.menuChoices = {};


XSS.menuSettings = {
    left: 40,
    top : 64
};


XSS.currentStageName = 'main';


XSS.menuHistory = [XSS.currentStageName];


/**
 * SelectMenu
 * Creates a single navigatable verticle menu
 * @param name
 * @constructor
 */
XSS.SelectMenu = function(name) {
    'use strict';

    var addOption, getOptionByIndex, getPixels, options = [];

    addOption = function(value, title, description) {
        options.push({
            value      : value,
            title      : title,
            description: description
        });
    };

    getOptionByIndex = function(index) {
        return options[index];
    };

    getPixels = function() {
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

        return XSS.drawables.getMenuPixels(name, XSS.menuSettings.left, XSS.menuSettings.top, settings);
    };

    return {
        addOption       : addOption,
        getOptionByIndex: getOptionByIndex,
        getPixels       : getPixels
    };
};


/**
 * BaseInputStage
 * Stage with a form input
 * @param name
 * @constructor
 */
XSS.BaseInputStage = function(name) {
    'use strict';

    var input = XSS.bootstrap.input,

        left = XSS.menuSettings.left,

        top = XSS.menuSettings.top,

        val = '',

        minlength = 0,

        maxlength = 150,

        defaultValue = '',

        label = '',

        labelWsp = 2,

        labelWidth = labelWsp,

        enterEvent = '/xss/key/enter.' + name,

        inputEvents = ['keydown.' + name, 'keyup.' + name].join(' '),

        setMinlength = function(minlengthOverwrite) {
            minlength = minlengthOverwrite;
        },

        setMaxlength = function(maxlengthOverwrite) {
            maxlength = maxlengthOverwrite;
        },

        setDefaultValue = function(defaultValueOverwrite) {
            defaultValue = defaultValueOverwrite;
        },

        setLabel = function(labelOverwrite) {
            label = labelOverwrite;
            labelWidth = XSS.font.getLength(label) + labelWsp;
        },

        getInstruction = function() {
            return 'Start typing and press Enter when you’re done';
        },

        getPixels = function() {
            return [].concat(
                XSS.font.write(left, top, label),
                XSS.font.write(left + labelWidth + labelWsp, top, val)
            );
        },

        addEventHandlers = function() {
            input.on(inputEvents, inputUpdate);
            input.trigger('focus').trigger('keyup');
            XSS.doc.on(enterEvent, inputSubmit);
        },

        removeEventHandlers = function() {
            input.off('inputEvents');
            XSS.doc.off(enterEvent);
            XSS.effects.blinkStop('caret');
        },

        removePixels = function() {
        },

        inputSubmit = function() {
            XSS.menu.switchStage(name, 'type');
        },

        inputUpdate = function() {
            var caretTextPos, caretGlobPos, caret;

            // Selected text: too much hassle
            if (input[0].selectionStart !== input[0].selectionEnd) {
                input[0].selectionStart = input[0].selectionEnd;
            }

            val = input.val();

            caretTextPos = XSS.font.getLength(val.substr(0, input[0].selectionStart));
            caretTextPos = caretTextPos || -1;

            caretGlobPos = left + labelWidth + labelWsp + caretTextPos;

            caret = XSS.drawables.line(caretGlobPos, top - 1, caretGlobPos, top + 6);

            XSS.effects.blink('caret', caret);
            XSS.menu.refreshStage();
        };

    return {
        setMinlength       : setMinlength,
        setMaxlength       : setMaxlength,
        setLabel           : setLabel,
        setDefaultValue    : setDefaultValue,
        getInstruction     : getInstruction,
        getPixels          : getPixels,
        getTravelPixels    : getPixels,
        addEventHandlers   : addEventHandlers,
        removeEventHandlers: removeEventHandlers,
        removePixels       : removePixels
    };
};


/**
 * BaseScreenStage
 * Stage with static content
 * @param name
 * @constructor
 */
XSS.BaseScreenStage = function(name) {
    'use strict';

    var screen = [],

        returnEvent = ['/xss/key/escape.' + name, '/xss/key/backspace.' + name].join(' '),

        setScreen = function(overwriteScreen) {
            screen = overwriteScreen;
        },

        getInstruction = function() {
            return 'Press Esc to go back';
        },

        getPixels = function() {
            return screen;
        },

        addEventHandlers = function() {
            XSS.doc.on(returnEvent, function() {
                var previousStageName, historyLength = XSS.menuHistory.length;
                if (historyLength > 1) {
                    previousStageName = XSS.menuHistory[historyLength - 2];
                    XSS.menu.switchStage(XSS.currentStageName, previousStageName, {back: true});
                }
            });
        },

        removeEventHandlers = function() {
            XSS.doc.off(returnEvent);
        },

        removePixels = function() {
            delete XSS.canvas.pixels.stage;
        };

    return {
        setScreen          : setScreen,
        getInstruction     : getInstruction,
        getPixels          : getPixels,
        getTravelPixels    : getPixels,
        addEventHandlers   : addEventHandlers,
        removeEventHandlers: removeEventHandlers,
        removePixels       : removePixels
    };
};


/**
 * BaseSelectStage
 * Stage with a vertical select menu
 * @param name
 * @constructor
 */
XSS.BaseSelectStage = function(name) {
    'use strict';

    var menu = new XSS.SelectMenu(name),

        events = {
            up    : '/xss/key/up.' + name,
            down  : '/xss/key/down.' + name,
            select: '/xss/key/enter.' + name,
            back  : ['/xss/key/escape.' + name, '/xss/key/backspace.' + name].join(' ')
        },

        getInstruction = function() {
            return 'Use arrow keys to navigate and Enter to select.';
        },

        getPixels = function() {
            return menu.getPixels(XSS.menuChoices[name]);
        },

        setMenu = function(overwriteMenu) {
            menu = overwriteMenu;
        },

        addEventHandlers = function() {
            XSS.menuChoices[name] = XSS.menuChoices[name] || 0;

            XSS.doc.on(events.down, function() {
                XSS.menuChoices[name] += 1;
                XSS.menu.refreshStage();
            });

            XSS.doc.on(events.up, function() {
                XSS.menuChoices[name] -= 1;
                XSS.menu.refreshStage();
            });

            XSS.doc.on(events.select, function() {
                var option = menu.getOptionByIndex(XSS.menuChoices[name]);
                XSS.menu.switchStage(XSS.currentStageName, option.value);
            });

            XSS.doc.on(events.back, function() {
                var previousStageName, historyLength = XSS.menuHistory.length;
                if (historyLength > 1) {
                    previousStageName = XSS.menuHistory[historyLength - 2];
                    XSS.menu.switchStage(XSS.currentStageName, previousStageName, {back: true});
                }
            });
        },

        removeEventHandlers = function() {
            XSS.doc.off([events.down, events.up, events.select, events.back].join(' '));
        },

        removePixels = function() {
            delete XSS.canvas.pixels.stage;
        };

    return {
        setMenu            : setMenu,
        getInstruction     : getInstruction,
        getPixels          : getPixels,
        getTravelPixels    : getPixels,
        addEventHandlers   : addEventHandlers,
        removeEventHandlers: removeEventHandlers,
        removePixels       : removePixels
    };
};


/**
 * Main Stage
 * Shown on first screen
 * @param name
 * @return {XSS.BaseSelectStage}
 * @constructor
 */
XSS.MainStage = function(name) {
    'use strict';

    var stage, menu;

    menu = new XSS.SelectMenu(name);
    menu.addOption('mp', 'MULTIPLAYER', 'Play with a friend or (un)friendly stranger.');
    menu.addOption('sp', 'SINGLE PLAYER', 'Play with yourself, get some practise.');
    menu.addOption('help', 'HEEELP?!!', 'How do I use this computer electronic device?');
    menu.addOption('credits', 'CREDITS', 'Made by Blaise Kal, 2012.');

    stage = new XSS.BaseSelectStage(name);
    stage.setMenu(menu);

    return stage;
};


/**
 * Multiplayer Stage
 * @param name
 * @return {XSS.BaseSelectStage}
 * @constructor
 */
XSS.MultiPlayerStage = function(name) {
    'use strict';

    var stage, menu;

    menu = new XSS.SelectMenu(name);
    menu.addOption('quick', 'QUICK MATCH WITH A STRANGER', 'Quickly play a game using matchmaking.');
    menu.addOption('host', 'HOST A PRIVATE GAME', 'Generates a secret game URL to give to a friend.');

    stage = new XSS.BaseSelectStage(name);
    stage.setMenu(menu);

    return stage;
};


/**
 * Game Type Stage
 * @param name
 * @return {XSS.BaseSelectStage}
 * @constructor
 */
XSS.GameTypeStage = function(name) {
    'use strict';

    var stage, menu;

    menu = new XSS.SelectMenu(name);
    menu.addOption('friendly', 'FRIENDLY MODE', 'May slightly dent your ego ♥');
    menu.addOption('xss', 'XSS MODE', ['The winner of the game is able to execute Java-',
        'script in the browser of the loser...  alert(’☠’)']);

    stage = new XSS.BaseSelectStage(name);
    stage.menu = menu;

    return stage;
};


/**
 * Credits Stage
 * @param name
 * @return {XSS.BaseScreenStage}
 * @constructor
 */
XSS.CreditsStage = function(name) {
    'use strict';

    var screen, stage,
        left = XSS.menuSettings.left,
        top = XSS.menuSettings.top;

    screen = [].concat(
        XSS.effects.zoomX2(XSS.font.write(0, 0, '<CREDITS>'), left, top),
        XSS.font.write(left, top + 18, 'Blaise Kal:'),
        XSS.font.write(left, top + 27, 'Placeholder:'),
        XSS.font.write(left, top + 35, 'Placeholder:'),
        XSS.font.write(left + 52, top + 18, 'Code, Pixels, Concept'),
        XSS.font.write(left + 52, top + 27, 'Testing, Hosting'),
        XSS.font.write(left + 52, top + 35, 'Testing, Snoek')
    );

    stage = new XSS.BaseScreenStage(name);
    stage.setScreen(screen);

    return stage;
};


/**
 * Help Stage
 * @param name
 * @return {XSS.BaseScreenStage}
 * @constructor
 */
XSS.HelpStage = function(name) {
    'use strict';

    var screen, stage,
        left = XSS.menuSettings.left,
        top = XSS.menuSettings.top;

    screen = [].concat(
        XSS.effects.zoomX2(XSS.font.write(0, 0, '<HEEELP?!!>'), left, top),
        XSS.font.write(left, top + 18, '• Play using the arrow keys on your keyboard'),
        XSS.font.write(left, top + 27, '• You can chat during the game by typing+enter'),
        XSS.font.write(left, top + 35, '• Open Source at github.com/blaisekal/xssnake'),
        XSS.font.write(left, top + 45, '• Github is also for bugs and feature requests'),
        XSS.font.write(left, top + 54, '• Other questions or issues: blaisekal@gmail.com')
    );

    stage = new XSS.BaseScreenStage(name);
    stage.setScreen(screen);

    return stage;
};


/**
 * Input name Stage
 * @param name
 * @return {XSS.BaseInputStage}
 * @constructor
 */
XSS.InputNameStage = function(name) {
    'use strict';

    var stage;

    stage = new XSS.BaseInputStage(name);
    stage.setLabel('What’s your name?');
    stage.setMinlength(2);
    stage.setMaxlength(10);
    // stage.setContinue('mptype');

    return stage;
};


/**
 * Menu instantiation, stage switching
 * @constructor
 */
XSS.Menu = function() {
    'use strict';

    var stages = {
            'main'   : XSS.MainStage('main'),
            'mp'     : XSS.InputNameStage('mp'),
            // mp     : XSS.MultiPlayerStage('mp'),
            'type'   : XSS.GameTypeStage('type'),
            'help'   : XSS.HelpStage('help'),
            'credits': XSS.CreditsStage('credits')
        },

        newStage = function(stageName) {
            var stage = stages[stageName];

            XSS.canvas.pixels.instruction = {
                pixels: XSS.font.write(XSS.menuSettings.left, 45, stage.getInstruction())
            };

            updateStage(stage);
            stage.addEventHandlers();
        },

        refreshStage = function() {
            updateStage(stages[XSS.currentStageName]);
        },

        updateStage = function(stage) {
            XSS.canvas.pixels.stage = {
                pixels: stage.getPixels()
            };
        },

        animateSwitchStage = function(oldStagePixels, newStagePixels, back, callback) {
            var oldStagePixelsAnim, newStagePixelsAnim,
                width = XSS.settings.width;

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
        },

        switchStage = function(currentStageName, newStageName, options) {
            var onAnimateDone = function() {
                // Load new stage
                XSS.currentStageName = newStageName;
                newStage(newStageName);

                // Log history
                if (options && options.back) {
                    XSS.menuHistory.pop();
                } else {
                    XSS.menuHistory.push(newStageName);
                }
            };

            if (!stages[newStageName]) {
                throw new Error('Stage does not exist: ' + newStageName);
            }

            // Unload old stage
            stages[currentStageName].removeEventHandlers();
            stages[currentStageName].removePixels();

            delete XSS.canvas.pixels.instruction;

            animateSwitchStage(
                stages[currentStageName].getTravelPixels(),
                stages[newStageName].getTravelPixels(),
                (options && options.back),
                onAnimateDone
            );
        };

    XSS.canvas.pixels.border = {
        pixels: XSS.drawables.getOuterBorderPixels()
    };

    XSS.canvas.pixels.header = {
        pixels: XSS.drawables.getHeaderPixels(XSS.menuSettings.left)
    };

    newStage(XSS.currentStageName);

    return {
        newStage    : newStage,
        refreshStage: refreshStage,
        switchStage : switchStage
    };
};
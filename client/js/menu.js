/*globals XSS*/

XSS.menuChoices = {};


XSS.StageInstructions = {
    select: 'Use arrow keys to navigate and Enter to select.',
    screen: ''
};


XSS.menuSettings = {
    left: 40,
    top: 64
};


XSS.currentStageName = 'main';


XSS.menuHistory = [XSS.currentStageName];


XSS.SelectMenu = function(name) {
    'use strict';

    var addOption, getOptionByIndex, getPixels, options = [];

    addOption = function(value, title, description) {
        options.push({
            value: value,
            title: title,
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
            options: options
        };

        return XSS.drawables.getMenuPixels(name, XSS.menuSettings.left, XSS.menuSettings.top, settings);
    };

    return {
        addOption        : addOption,
        getOptionByIndex : getOptionByIndex,
        getPixels        : getPixels
    };
};

XSS.BaseScreenStage = function(name, screen) {
    'use strict';

    var getPixels, getStageType, addEventHandlers, removeEventHandlers, removePixels,
        returnEvent = '/xss/key/escape.screen';

    getPixels = function() {
        return screen;
    };

    getStageType = function() {
        return 'screen';
    };

    addEventHandlers = function() {
        $(document).on(returnEvent, function() {
            var previousStageName, historyLength = XSS.menuHistory.length;
            if (historyLength > 1) {
                previousStageName = XSS.menuHistory[historyLength - 2];
                XSS.menu.switchStage(XSS.currentStageName, previousStageName, {back: true});
            }
        });
    };

    removeEventHandlers = function() {
        $(document).off(returnEvent);
    };

    removePixels = function() {
        delete XSS.canvas.pixels.stage;
    };

    return {
        getPixels           : getPixels,
        getTravelPixels     : getPixels,
        getStageType        : getStageType,
        addEventHandlers    : addEventHandlers,
        removeEventHandlers : removeEventHandlers,
        removePixels        : removePixels
    };
};


XSS.BaseSelectStage = function(name, selectMenu) {
    'use strict';

    var getPixels, getStageType, addEventHandlers, removeEventHandlers, removePixels,
        upEvent     = '/xss/key/up.' + name,
        downEvent   = '/xss/key/down.' + name,
        selectEvent = '/xss/key/enter.' + name,
        backEvent   = ['/xss/key/escape.' + name, '/xss/key/backspace.' + name].join(' ');

    getPixels = function() {
        return selectMenu.getPixels(XSS.menuChoices[name]);
    };

    getStageType = function() {
        return 'select';
    };

    addEventHandlers = function() {
        XSS.menuChoices[name] = XSS.menuChoices[name] || 0;

        $(document).on(downEvent, function() {
            XSS.menuChoices[name] += 1;
            XSS.menu.refreshStage();
        });

        $(document).on(upEvent, function() {
            XSS.menuChoices[name] -= 1;
            XSS.menu.refreshStage();
        });

        $(document).on(selectEvent, function() {
            var option = selectMenu.getOptionByIndex(XSS.menuChoices[name]);
            XSS.menu.switchStage(XSS.currentStageName, option.value);
        });

        $(document).on(backEvent, function() {
            var previousStageName, historyLength = XSS.menuHistory.length;
            if (historyLength > 1) {
                previousStageName = XSS.menuHistory[historyLength - 2];
                XSS.menu.switchStage(XSS.currentStageName, previousStageName, {back: true});
            }
        });
    };

    removeEventHandlers = function() {
        $(document).off([downEvent, upEvent, selectEvent, backEvent].join(' '));
    };

    removePixels = function() {
        delete XSS.canvas.pixels.stage;
    };

    return {
        getPixels           : getPixels,
        getTravelPixels     : getPixels,
        getStageType        : getStageType,
        addEventHandlers    : addEventHandlers,
        removeEventHandlers : removeEventHandlers,
        removePixels        : removePixels
    };
};


XSS.MainStage = function(name) {
    'use strict';

    var menu = new XSS.SelectMenu(name);
    menu.addOption('mp', 'MULTIPLAYER', 'Play with a friend or (un)friendly stranger.');
    menu.addOption('sp', 'SINGLE PLAYER', 'Play with yourself, get some practise.');
    menu.addOption('help', 'HEEELP?!!', 'How do I use this computer electronic device?');
    menu.addOption('credits', 'CREDITS', 'Made by Blaise Kal, 2012.');

    return new XSS.BaseSelectStage(name, menu);
};


XSS.MultiPlayerStage = function(name) {
    'use strict';

    var menu = new XSS.SelectMenu(name);
    menu.addOption('quick', 'QUICK MATCH WITH A STRANGER', 'Quickly play a game using matchmaking.');
    menu.addOption('host', 'HOST A PRIVATE GAME', 'Generates a secret game URL to give to a friend.');

    return new XSS.BaseSelectStage(name, menu);
};


XSS.CreditsStage = function(name) {
    'use strict';

    var screen,
        left = XSS.menuSettings.left,
        top = XSS.menuSettings.top;

    screen = [].concat(
        XSS.effects.zoomX2(XSS.font.write(0, 0, '* Credits'), left, top-14),
        XSS.font.write(left, top+9, 'Blaise Kal:'),
        XSS.font.write(left, top+18, 'Placeholder:'),
        XSS.font.write(left, top+27, 'Placeholder:'),
        XSS.font.write(left, top+40, '(press Esc to go back)'),
        XSS.font.write(left+52, top+9, 'Code, Pixels, Concept'),
        XSS.font.write(left+52, top+18, 'Testing, Hosting'),
        XSS.font.write(left+52, top+27, 'Testing, Snoek')
    );

    return new XSS.BaseScreenStage(name, screen);
};


XSS.HelpStage = function(name) {
    'use strict';

    var screen,
        left = XSS.menuSettings.left,
        top = XSS.menuSettings.top;

    screen = [].concat(
        XSS.effects.zoomX2(XSS.font.write(0, 0, '* Heeelp?!!'), left, top-14),
        XSS.font.write(left, top+9, '• Play using the arrow keys on your keyboard'),
        XSS.font.write(left, top+18, '• You can chat during the game by typing+enter'),
        XSS.font.write(left, top+27, '• Open Source at github.com/blaisekal/xssnake'),
        XSS.font.write(left, top+36, '• Github is also for bugs and feature requests'),
        XSS.font.write(left, top+45, '• Other questions or issues: blaisekal@gmail.com'),
        XSS.font.write(left, top+58, '(press Esc to go back)')
    );

    return new XSS.BaseScreenStage(name, screen);
};


XSS.Menu = function() {
    'use strict';

    var stages, newStage, animateSwitchStage, switchStage, refreshStage, updateStage;

    stages = {
        main    : XSS.MainStage('main'),
        mp      : XSS.MultiPlayerStage('mp'),
        help    : XSS.HelpStage('credits'),
        credits : XSS.CreditsStage('credits')
    };

    newStage = function(stageName) {
        var stage = stages[stageName];

        XSS.canvas.pixels.instruction = {
            pixels: XSS.font.write(XSS.menuSettings.left, 45, XSS.StageInstructions[stage.getStageType()])
        };

        updateStage(stage);
        stage.addEventHandlers();
    };

    refreshStage = function() {
        updateStage(stages[XSS.currentStageName]);
    };

    updateStage = function(stage) {
        XSS.canvas.pixels.stage = {
            pixels: stage.getPixels()
        };
    };

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

    };

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
        pixels: XSS.drawables.getHeaderPixels(XSS.menuSettings.left, 23)
    };

    newStage(XSS.currentStageName);

    return {
        newStage     : newStage,
        refreshStage : refreshStage,
        switchStage  : switchStage
    };

};
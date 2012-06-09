/*globals XSS*/

XSS.menuChoices = {};


XSS.StageInstructions = {
    select: 'Use arrow keys to navigate and Enter to select.'
};


XSS.menuSettings = {
    left: 40,
    top: 60
};


XSS.stage = 'main';


XSS.SelectMenu = function(name) {
    'use strict';

    var addOption, getPixels, options = [];

    addOption = function(value, title, description) {
        options.push({
            value: value,
            title: title,
            description: description
        });
    };

    getPixels = function() {
        if (XSS.menuChoices[name] < 0) {
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
        addOption : addOption,
        getPixels : getPixels
    };
};


XSS.BaseSelectStage = function(name, selectMenu) {
    'use strict';

    var getPixels, getStageType, addEventHandlers,
        upEvent = '/xss/key/up.' + name,
        downEvent = '/xss/key/down.' + name,
        SelectEvent = '/xss/key/enter.' + name,
        BackEvent = '/xss/key/escape.' + name + ' /xss/key/backspace.' + name;

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
            XSS.menu.updateStage();
        });

        $(document).on(upEvent, function() {
            XSS.menuChoices[name] -= 1;
            XSS.menu.updateStage();
        });
    };

    return {
        getPixels       : getPixels,
        getTravelPixels : getPixels,
        getStageType    : getStageType,
        addEventHandlers: addEventHandlers
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

    var menu = new XSS.SelectMenu();
    menu.addOption('quick', 'QUICK MATCH WITH A STRANGER', 'Quickly play a game using matchmaking.');
    menu.addOption('host', 'HOST A PRIVATE GAME', 'Generates a secret game URL to give to a friend.');

    return new XSS.BaseSelectStage(name, menu);
};


XSS.Menu = function() {
    'use strict';

    var stages, initStage, showStage, updateStage;

    stages = {
            main: XSS.MainStage('main'),
            mp  : XSS.MultiPlayerStage('mp')
    };

    initStage = function(stage) {
        XSS.canvas.pixels.instruction = {
            pixels: XSS.font.write(XSS.menuSettings.left, 45, XSS.StageInstructions[stage.getStageType()])
        };

        showStage(stage);
        stage.addEventHandlers();
    };

    updateStage = function() {
        showStage(stages[XSS.stage]);
    };

    showStage = function(stage) {
        XSS.canvas.pixels.stage = {
            pixels: stage.getPixels()
        };
    };

    XSS.canvas.pixels.border = {
        pixels: XSS.drawables.getOuterBorderPixels()
    };

    XSS.canvas.pixels.header = {
        pixels: XSS.drawables.getHeaderPixels(XSS.menuSettings.left, 23)
    };

    initStage(stages[XSS.stage]);

    // TODO: Enter, Escape travelpixels

    return {
        updateStage: updateStage
    };

};
/*globals XSS*/

XSS.menuChoices = {};


XSS.StageInstructions = {
    select: 'Use arrow keys to navigate and Enter to select.'
};


XSS.menuSettings = {
    left: 40,
    top: 60
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


XSS.BaseSelectStage = function(name, selectMenu) {
    'use strict';

    var getPixels, getStageType, addEventHandlers, removeEventHandlers,
        upEvent     = '/xss/key/up.' + name,
        downEvent   = '/xss/key/down.' + name,
        selectEvent = '/xss/key/enter.' + name,
        backEvent   = '/xss/key/escape.' + name + ' /xss/key/backspace.' + name;

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
        $(document).off([downEvent, upEvent, selectEvent].join(' '));
    };

    return {
        getPixels           : getPixels,
        getTravelPixels     : getPixels,
        getStageType        : getStageType,
        addEventHandlers    : addEventHandlers,
        removeEventHandlers : removeEventHandlers
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


XSS.Menu = function() {
    'use strict';

    var stages, newStage, switchStage, refreshStage, updateStage;

    stages = {
        main : XSS.MainStage('main'),
        mp   : XSS.MultiPlayerStage('mp')
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

    switchStage = function(currentStageName, newStageName, options) {
        options = options || {};

        // Unload old stage
        stages[currentStageName].removeEventHandlers();

        // Load new stage
        XSS.currentStageName = newStageName;
        newStage(newStageName);

        // Log history
        if (options.back) {
            XSS.menuHistory.pop();
        } else {
            XSS.menuHistory.push(newStageName);
        }
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
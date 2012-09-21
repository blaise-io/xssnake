/*jshint globalstrict:true*/
/*globals XSS, SelectMenu, SelectStage, ScreenStage, InputStage, GameStage, PixelEntity*/

'use strict';

/**
 * Main Stage
 * @param {string} name
 * @returns SelectStage
 */
XSS.MainStage = function(name) {
    var menu;

    menu = new SelectMenu(name);
    menu.addOption(null, 'name', 'MULTIPLAYER', 'Play with a friend or (un)friendly stranger.');
    menu.addOption(null, 'sp', 'SINGLE PLAYER', 'Play with yourself, get some practise.');
    menu.addOption(null, 'help', 'HEEELP?!!', 'How do I use this computer electronic device?');
    menu.addOption(null, 'credits', 'CREDITS', 'Made by Blaise Kal, 2012.');

    return new SelectStage(name, menu);
};


/**
 * Room Type Stage
 * @param {string} name
 * @returns SelectStage
 */
XSS.AskPublicStage = function(name) {
    var menu;

    menu = new SelectMenu(name);
    menu.addOption(true, 'friendly', 'QUICK MATCH WITH A STRANGER', 'Quickly play a game using matchmaking.');
    menu.addOption(false, 'friendly', 'HOST A PRIVATE GAME', 'Generates a secret game URL to give to a friend.');

    return new SelectStage(name, menu);
};


/**
 * Game Type Stage
 * @param {string} name
 * @returns SelectStage
 */
XSS.AskFriendlyStage = function(name) {
    var menu;

    menu = new SelectMenu(name);
    menu.addOption(true, 'mpgame', 'FRIENDLY MODE', 'May slightly dent your ego ♥');
    menu.addOption(false, 'mpgame', 'XSS MODE',
        'The winner of the game is able to execute Java-\n' +
        'script in the browser of the loser...  alert(’☠’)');

    return new SelectStage(name, menu);
};


/**
 * Credits Stage
 * @param {string} name
 * @returns ScreenStage
 */
XSS.CreditsStage = function(name) {
    var screen, left, top;

    left = XSS.MENU_LEFT;
    top = XSS.MENU_TOP;

    screen = new PixelEntity(
        XSS.effects.zoomX2(XSS.font.draw(0, 0, '<CREDITS>'), left, top),
        XSS.font.draw(left, top + 18, 'Blaise Kal:'),
        XSS.font.draw(left, top + 27, 'Placeholder:'),
        XSS.font.draw(left, top + 35, 'Placeholder:'),
        XSS.font.draw(left + 52, top + 18, 'Code, Pixels, Concept'),
        XSS.font.draw(left + 52, top + 27, 'Testing, Hosting'),
        XSS.font.draw(left + 52, top + 35, 'Testing, Snoek')
    );

    return new ScreenStage(name, screen);
};


/**
 * Help Stage
 * @param {string} name
 * @return {ScreenStage}
 */
XSS.HelpStage = function(name) {
    var screen, left, top;

    left = XSS.MENU_LEFT;
    top = XSS.MENU_TOP;

    screen = new PixelEntity(
        XSS.effects.zoomX2(XSS.font.draw(0, 0, '<HEEELP?!!>'), left, top),
        XSS.font.draw(left, top + 18, '• Play using the arrow keys on your keyboard'),
        XSS.font.draw(left, top + 27, '• You can chat during the game by typing+enter'),
        XSS.font.draw(left, top + 35, '• Open Source at github.com/blaisekal/xssnake'),
        XSS.font.draw(left, top + 45, '• Github is also for bugs and feature requests'),
        XSS.font.draw(left, top + 54, '• Other questions or issues: blaisekal@gmail.com')
    );

    return new ScreenStage(name, screen);
};


/**
 * Input name Stage
 * @param {string} name
 * @return {InputStage}
 */
XSS.NameStage = function(name) {
    var stage;

    stage = new InputStage(name, 'pub');
    stage.setLabel('Hello, my name is');
    stage.minlength = 2;
    stage.maxlength = 10;

    return stage;
};


XSS.GameStage = function(name) {

    return new GameStage(name);

};


/**
 * Set up stages
 * @constructor
 */
function Stages() {

    this.choices = {};
    this.current = 'main';
    this.course = [this.current];

    XSS.menu.setStages({
        'main'    : XSS.MainStage('main'),
        'name'    : XSS.NameStage('name'),
        'pub'     : XSS.AskPublicStage('pub'),
        'friendly': XSS.AskFriendlyStage('friendly'),
        'mpgame'  : XSS.GameStage('mpgame'),
        'help'    : XSS.HelpStage('help'),
        'credits' : XSS.CreditsStage('credits')
    });
}

Stages.prototype = {

    init: function() {
        XSS.menu.newStage(this.current);
        XSS.menu.setupMenuSkeletton();
    },

    getNamedChoices: function() {
        var stage, choices, value, namedChoices = {};
        choices = XSS.stages.choices;
        for (var k in choices) {
            if (choices.hasOwnProperty(k)) {
                stage = XSS.menu.stages[k];
                if (stage.menu) {
                    value = stage.menu.opts[choices[k]].value;
                    if (value !== null) {
                        namedChoices[k] = stage.menu.opts[choices[k]].value;
                    }
                } else {
                    namedChoices[k] = choices[k];
                }
            }
        }
        return namedChoices;
    }

};
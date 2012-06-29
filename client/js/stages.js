/*jshint globalstrict:true*/
/*globals XSS, SelectMenu, BaseSelectStage, BaseScreenStage, BaseInputStage*/

'use strict';

/**
 * Main Stage
 * @param name
 * @returns BaseSelectStage
 */
XSS.MainStage = function(name) {
    var stage, menu;

    menu = new SelectMenu(name);
    menu.addOption('mp', 'MULTIPLAYER', 'Play with a friend or (un)friendly stranger.');
    menu.addOption('sp', 'SINGLE PLAYER', 'Play with yourself, get some practise.');
    menu.addOption('help', 'HEEELP?!!', 'How do I use this computer electronic device?');
    menu.addOption('credits', 'CREDITS', 'Made by Blaise Kal, 2012.');

    stage = new BaseSelectStage(name);
    stage.menu = menu;

    return stage;
};


/**
 * Multiplayer Stage
 * @param name
 * @returns BaseSelectStage
 */
XSS.MultiPlayerStage = function(name) {
    var stage, menu;

    menu = new SelectMenu(name);
    menu.addOption('quick', 'QUICK MATCH WITH A STRANGER', 'Quickly play a game using matchmaking.');
    menu.addOption('host', 'HOST A PRIVATE GAME', 'Generates a secret game URL to give to a friend.');

    stage = new BaseSelectStage(name);
    stage.menu = menu;

    return stage;
};


/**
 * Game Type Stage
 * @param name
 * @returns BaseSelectStage
 */
XSS.GameTypeStage = function(name) {
    var stage, menu;

    menu = new SelectMenu(name);
    menu.addOption('friendly', 'FRIENDLY MODE', 'May slightly dent your ego ♥');
    menu.addOption('XSS', 'XSS MODE', ['The winner of the game is able to execute Java-',
        'script in the browser of the loser...  alert(’☠’)']);

    stage = new BaseSelectStage(name);
    stage.menu = menu;

    return stage;
};


/**
 * Credits Stage
 * @param name
 * @returns BaseScreenStage
 */
XSS.CreditsStage = function(name) {
    var screen, stage,
        left = XSS.MENULEFT,
        top = XSS.MENUTOP;

    screen = [].concat(
        XSS.effects.zoomX2(XSS.font.write(0, 0, '<CREDITS>'), left, top),
        XSS.font.write(left, top + 18, 'Blaise Kal:'),
        XSS.font.write(left, top + 27, 'Placeholder:'),
        XSS.font.write(left, top + 35, 'Placeholder:'),
        XSS.font.write(left + 52, top + 18, 'Code, Pixels, Concept'),
        XSS.font.write(left + 52, top + 27, 'Testing, Hosting'),
        XSS.font.write(left + 52, top + 35, 'Testing, Snoek')
    );

    stage = new BaseScreenStage(name);
    stage.screen = screen;

    return stage;
};


/**
 * Help Stage
 * @param name
 * @return {BaseScreenStage}
 */
XSS.HelpStage = function(name) {
    var screen, stage,
        left = XSS.MENULEFT,
        top = XSS.MENUTOP;

    screen = [].concat(
        XSS.effects.zoomX2(XSS.font.write(0, 0, '<HEEELP?!!>'), left, top),
        XSS.font.write(left, top + 18, '• Play using the arrow keys on your keyboard'),
        XSS.font.write(left, top + 27, '• You can chat during the game by typing+enter'),
        XSS.font.write(left, top + 35, '• Open Source at github.com/blaisekal/xssnake'),
        XSS.font.write(left, top + 45, '• Github is also for bugs and feature requests'),
        XSS.font.write(left, top + 54, '• Other questions or issues: blaisekal@gmail.com')
    );

    stage = new BaseScreenStage(name);
    stage.screen = screen;

    return stage;
};


/**
 * Input name Stage
 * @param name
 * @return {BaseInputStage}
 */
XSS.InputNameStage = function(name) {
    var stage;

    stage = new BaseInputStage(name);
    stage.setLabel('What’s your name?');
    stage.minlength = 2;
    stage.maxlength = 10;

    return stage;
};

/**
 * Set up stages
 * @constructor
 */
function Stages() {
    XSS.menu.setStages({
        'main'   : XSS.MainStage('main'),
        'mp'     : XSS.InputNameStage('mp'),
        'type'   : XSS.GameTypeStage('type'),
        'help'   : XSS.HelpStage('help'),
        'credits': XSS.CreditsStage('credits')
    });
    XSS.menu.newStage(XSS.currentStageName);
    XSS.menu.setupMenuSkeletton();
}
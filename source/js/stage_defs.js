/*jshint globalstrict:true*/
/*globals XSS, SelectMenu, SelectStage, ScreenStage, InputStage, GameStage, Shape*/

'use strict';

XSS.stages = {

    /**
     * @return {SelectStage}
     */
    main: function() {
        var menu;

        menu = new SelectMenu('main');
        menu.addOption(null, XSS.stages.inputName, 'MULTIPLAYER', 'Play with a friend or (un)friendly stranger.');
        menu.addOption(null, XSS.stages.startGame, 'SINGLE PLAYER', 'Play with yourself, get some practise.');
        menu.addOption(null, XSS.stages.helpScreen, 'HEEELP?!!', 'How do I use this computer electronic device?');
        menu.addOption(null, XSS.stages.creditsScreen, 'CREDITS', 'Made by Blaise Kal, 2012.');

        return new SelectStage(menu);
    },

    /**
     * @return {SelectStage}
     */
    askIsPublic: function() {
        var menu;

        menu = new SelectMenu('public');
        menu.addOption(true, XSS.stages.askIsFriendly, 'QUICK MATCH WITH A STRANGER', 'Quickly play a game using matchmaking.');
        menu.addOption(false, XSS.stages.askIsFriendly, 'HOST A PRIVATE GAME', 'Generates a secret game URL to give to a friend.');

        return new SelectStage(menu);
    },

    /**
     * @return {SelectStage}
     */
    askIsFriendly: function() {
        var menu;

        menu = new SelectMenu('friendly');
        menu.addOption(true, XSS.stages.startGame, 'FRIENDLY MODE', 'May slightly dent your ego ♥');
        menu.addOption(false, XSS.stages.startGame, 'XSS MODE',
            'The winner of the game is able to execute Java-\n' +
                'script in the browser of the loser...  alert(’☠’)');

        return new SelectStage(menu);
    },

    /**
     * @return {ScreenStage}
     */
    creditsScreen: function() {
        var screen, left, top;

        left = XSS.MENU_LEFT;
        top = XSS.MENU_TOP;

        screen = new Shape(
            XSS.transform.zoomX2(XSS.font.draw(0, 0, '<CREDITS>'), left, top),
            XSS.font.draw(left, top + 18, 'Blaise Kal:'),
            XSS.font.draw(left, top + 27, 'Placeholder:'),
            XSS.font.draw(left, top + 35, 'Placeholder:'),
            XSS.font.draw(left + 52, top + 18, 'Code, Pixels, Concept'),
            XSS.font.draw(left + 52, top + 27, 'Testing, Hosting'),
            XSS.font.draw(left + 52, top + 35, 'Testing, Snoek')
        );

        return new ScreenStage(screen);
    },

    /**
     * @return {ScreenStage}
     */
    helpScreen: function() {
        var screen, left, top;

        left = XSS.MENU_LEFT;
        top = XSS.MENU_TOP;

        screen = new Shape(
            XSS.transform.zoomX2(XSS.font.draw(0, 0, '<HEEELP?!!>'), left, top),
            XSS.font.draw(left, top + 18, '• Play using the arrow keys on your keyboard'),
            XSS.font.draw(left, top + 27, '• You can chat during the game by typing+enter'),
            XSS.font.draw(left, top + 35, '• Open Source at github.com/blaisekal/xssnake'),
            XSS.font.draw(left, top + 45, '• Github is also for bugs and feature requests'),
            XSS.font.draw(left, top + 54, '• Other questions or issues: blaisekal@gmail.com')
        );

        return new ScreenStage(screen);
    },

    /**
     * @return {InputStage}
     */
    inputName: function() {
        var stage;

        stage = new InputStage('name', XSS.stages.askIsPublic);
        stage.setLabel('Hello, my name is');
        stage.minlength = 2;
        stage.maxlength = 10;

        return stage;
    },

    /**
     * @return {GameStage}
     */
    startGame: function() {
        return new GameStage();
    }

};
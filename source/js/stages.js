/*jshint globalstrict:true, es5:true, sub:true*/
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
        menu.addOption(null, XSS.stages.themesScreen, 'THEEEMES', 'Change the color scheme YAY!');
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
        menu.addOption(true, XSS.stages.startGame, 'FRIENDLY MODE',
            'May slightly dent your ego ' + XSS.UNICODE_HEART);
        menu.addOption(false, XSS.stages.startGame, 'XSS MODE',
            'The winner of the game is allowed to execute Java-\n' +
            'script in loser\'s browser…  alert(\'' + XSS.UNICODE_SKULL + '\')');

        return new SelectStage(menu);
    },

    themesScreen: function() {
        var menu, setTheme;

        setTheme = function(index) {
            XSS.canvas.setTheme(XSS.themes[index]);
        };

        menu = new SelectMenu('theme');
        for (var i = 0, m = XSS.themes.length; i < m; i++) {
            var title = XSS.themes[i].title,
                desc = XSS.themes[i].desc;
            menu.addOption(true, null, title, desc, setTheme);
        }

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
            XSS.transform.zoomX2(XSS.font.pixels('<CREDITS>', 0, 0), left, top),
            XSS.font.pixels('Blaise Kal: Code, Pixels, Font, Concept.', left, top + 18)
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
            XSS.transform.zoomX2(XSS.font.pixels('<HEEELP?!!>', 0, 0), left, top),
            XSS.font.pixels('• Play using the arrow keys on your keyboard', left, top + 18),
            XSS.font.pixels('• You can chat during the game by pressing Enter', left, top + 27),
            XSS.font.pixels('• Open Source at github.com/blaisekal/xssnake', left, top + 36),
            XSS.font.pixels('• Github is also for bugs and feature requests', left, top + 45),
            XSS.font.pixels('• Other questions or issues: blaisekal@gmail.com', left, top + 54)
        );

        return new ScreenStage(screen);
    },

    /**
     * @return {InputStage}
     */
    inputName: function() {
        var stage, nextstage = XSS.stages.askIsPublic;

        stage = new InputStage('name', nextstage, 'Ohi! My name is ');
        stage.minlength = 2;
        stage.maxWidth = XSS.UI_MAX_NAME_WIDTH;

        return stage;
    },

    /**
     * @return {GameStage}
     */
    startGame: function() {
        return new GameStage();
    }

};
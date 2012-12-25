/*jshint globalstrict:true, es5:true, sub:true, evil:true*/
/*globals XSS, SelectMenu, SelectStage, ScreenStage, InputStage, GameStage, Shape, Util*/

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
        menu.addOption(false, XSS.stages.captcha, 'XSS MODE',
            'The winner of a game is allowed to execute\n' +
            'JavaScript in the browsers of all losers…\n' +
            'while(true) alert(\'' + XSS.UNICODE_SKULL + '\');');

        return new SelectStage(menu);
    },

    /**
     * @return {InputStage}
     */
    captcha: function() {
        var challenges, challenge, intro, stage, str, digit,
            nextstage = XSS.stages.startGame;

        str = Util.randomStr().substr(0, 3);
        digit = String(Util.randomBetween(0, 5));

        challenges = [
            'Array(document.scripts[0].tagName.length).join(\'\/\');',
            'location.protocol.split(\'\').reverse().join()[0];',
            '\'cakeshake!\'.charAt(Math.ceil(Math.random())*%d));',
            'Array(%d).join(encodeURI(\' \'));',
            'String(parseInt(\'FF\', 16));',
            'JSON.stringify({foo:\'%s\'});',
            'String([1,2,3][3]).charAt(%d);',
            'String(typeof []).charAt(%d);',
            'String(typeof (5%2)).charAt(%d);',
            'String(/%s/.test(\'%s\'));',
            '\'1234512345\'.split(\'\').lastIndexOf(%d);'
        ];

        challenge = Util.randomItem(challenges);
        challenge = challenge.replace(/%s/g, str);
        challenge = challenge.replace(/%d/g, digit);

        intro = 'XSS mode allows the winner of a game to execute\n' +
                'JavaScript in the browsers of all losers. This may\n' +
                'damage you and/or your computer. If you accept\n' +
                'this risk, please enter the result of this statement:\n\n> ' +
                challenge + '\n> ';

        stage = new InputStage('', nextstage, intro);
        stage.inputSubmit = function(error, value) {
            var top = XSS.font.height(intro);
            XSS.stages._captchaSubmit.call(stage, value, challenge, top);
        };

        return stage;
    },

    /**
     * @param {string} value
     * @param {string} challenge
     * @param {number} top
     * @private
     */
    _captchaSubmit: function(value, challenge, top) {
        var shape, text = '> ACCESS DENIED!!';

        if (value === String(eval(challenge))) { // 666
            text = '> bleep!';
            setTimeout(function() {
                XSS.stageflow.switchStage(this.nextStage);
            }.bind(this), 1000);
        }

        shape = XSS.font.shape(text, XSS.MENU_LEFT, XSS.MENU_TOP + top);
        shape.lifetime(0, 1000);
        XSS.shapes.message = shape;
    },

    themesScreen: function() {
        var setTheme, menu = new SelectMenu('theme');

        setTheme = function(index) {
            XSS.canvas.setTheme(XSS.themes[index]);
        };

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
        var stage, label, nextstage;

        label = 'Ohi! My name is ';
        nextstage = XSS.stages.askIsPublic;

        stage = new InputStage('name', nextstage, label, XSS.UI_MAX_NAME_WIDTH);
        stage.inputSubmit = XSS.stages._inputNameSubmit;

        return stage;
    },

    /**
     * @param {string} error
     * @param {string} value
     * @private
     */
    _inputNameSubmit: function(error, value) {
        var wits, shape, text, duration = 500;

        wits = [
            '%s%s%s',
            'You have the same name as my mom',
            'LOVELY ' + new Array(4).join(XSS.UNICODE_HEART),
            XSS.UNICODE_SKULL,
            'Lamest name EVER',
            'Clever name!',
            'Mmm I love the way you handled that keyboard',
            'asdasdasdasd',
            'Please dont touch anything',
            'Hello %s',
            'Is that your real name?',
            'You dont look like a %s...',
            'Are you new here?',
            'I remember you',
            'I dont believe that\'s your name, but continue anyway',
            'Can I have your number?',
            'My name is NaN',
            '#$%^&*!!',
            'I thought I banned you?',
            'Jesus saves',
            'Is this your first time online?',
            'Are you from the internet?',
            '%s? OMGOMG'
        ];

        if (error) {
            text = error;
        } else {
            text = Util.randomItem(wits);
            text = text.replace(/%s/g, value);
            duration = Math.max(text.length * 30, 500);
            setTimeout(function() {
                XSS.stageflow.switchStage(this.nextStage);
            }.bind(this), duration + 50);
        }

        shape = XSS.font.shape(text, XSS.MENU_LEFT, XSS.MENU_TOP + 9);
        shape.lifetime(0, duration);
        XSS.shapes.message = shape;
    },

    /**
     * @return {GameStage}
     */
    startGame: function() {
        return new GameStage();
    }

};
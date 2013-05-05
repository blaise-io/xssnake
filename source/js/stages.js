/*jshint globalstrict:true, es5:true, sub:true, evil:true*/
/*globals XSS, ClientLevel, ClientSnake, ShapePixels, SelectMenu, SelectStage, ScreenStage, InputStage, Font, FormStage, Form, GameStage, Room, Shape, Socket*/

'use strict';

// TODO: Remove logic, only allow copy and Stage classes inits.

XSS.stages = {

    /**
     * @return {SelectStage}
     */
    main: function() {
        var menu, name, header, footer;

        name = XSS.util.storage(XSS.STORAGE_NAME);
        header = name ?
                  'WLCM BCK ' + name.toUpperCase() + '!' :
                  'WELCOME STRANGER!!';

        footer = '' +
            'Press M to mute/unmute sounds.\n' +
            'Use arrow keys, Esc and ' + XSS.UC_ENTER_KEY + ' to navigate.';

        menu = new SelectMenu('main', header, footer);
        menu.addOption(null, XSS.stages.inputName, 'MULTIPLAYER');
        menu.addOption(null, XSS.stages.startGame, 'SINGLE PLAYER');
        menu.addOption(null, XSS.stages.colorScheme, 'COLOR SCHEME');
        menu.addOption(null, XSS.stages.credits, 'CREDITS');

        if (XSS.util.hash(XSS.HASH_ROOM)) {
            XSS.stages._autoJoinRoom();
        } else {
            window.setTimeout(XSS.stages._menuSnake, 1e3);
        }

        return new SelectStage(menu);
    },

    _menuSnake: function() {
        var snake;

        if (XSS.room) {
            return;
        }

        snake = new ClientSnake(0, true, '', [1, 1], 2);
        snake.addToShapes();
        snake.addControls();
        snake.showDirection();

        XSS.menuSnake = snake;

        var isPixel = function(nextpos) {
            var snakeShape, intersect = false;
            snakeShape = XSS.shapes[snake.shapes.snake];
            if (nextpos[0] < 0 || nextpos[1] < 0) {
                intersect = true;
            } else {
                snakeShape.pixels.each(function(x, y) {
                    if (x % 2 || y % 2) {
                        if (snakeShape.pixels.hasMultiple(XSS.shapes, x, y)) {
                            intersect = true;
                        }
                    }
                });
            }
            return intersect;
        };

        var update = function() {
            var nextpos;
            if (XSS.room || !XSS.shapes[snake.shapes.snake]) {
                if (snake.destroy) {
                    snake.destroy();
                }
                return;
            }
            snake.removeNameAndDirection();
            nextpos = snake.getNextPosition();
            if (isPixel(nextpos)) {
                snake.crash();
                snake.showAction('CRASH!');
                window.setTimeout(snake.destruct.bind(snake), 1000);
                 // Pay for killing the snake
                window.setTimeout(XSS.stages._menuSnake, 1e5);
            } else {
                snake.move(nextpos);
                snake.updateShape();
                window.setTimeout(update, 100);
            }
        };

        window.setTimeout(update, 1e3);
    },

    _autoJoinRoom: function() {
        var title = 'Auto-join room';
        XSS.util.dialog(title, 'Connecting to server...');

        XSS.pubsub.subscribe(XSS.PUB_ROOM_STATUS, XSS.PUB_NS_STAGES, function(data) {
            XSS.pubsub.unsubscribe(XSS.PUB_ROOM_STATUS, XSS.PUB_NS_STAGES);
            if (!data[0]) {
                XSS.util.error(Room.prototype.errorCodeToStr(data[1]));
            } else {
                XSS.stages.autoJoinData = data;
                XSS.shapes.dialog = null;
                XSS.flow.switchStage(XSS.stages.autoJoin);
            }
        });

        XSS.socket = new Socket(function() {
            XSS.util.dialog(title, 'Getting room properties...');
            window.setTimeout(function() {
                XSS.socket.emit(
                    XSS.events.SERVER_ROOM_STATUS,
                    XSS.util.hash(XSS.HASH_ROOM)
                );
            }, 2000);
        });
    },

    /**
     * @return {InputStage}
     */
    autoJoin: function() {
        var diffs, bools, field, options, players, sep, label, next, stage;

        diffs = {
            '1': 'Worm',
            '2': 'Snake',
            '3': 'Python'
        };

        bools = {
            'false': 'No',
            'true' : 'Yes'
        };

        field = XSS.map.FIELD;
        options = XSS.stages.autoJoinData[1];
        players = XSS.stages.autoJoinData[2];
        sep = '\n';

        label = '' +
            'Players ' + players.length + '/' + options[field.MAX_PLAYERS] +
                        ': ' + players.join(', ') + sep +
            'Difficulty: ' + diffs[options[field.DIFFICULTY]] + sep +
            'Power-Ups: ' + bools[options[field.POWERUPS]] + sep +
            'XSS ' + XSS.UC_SKULL + ': ' + bools[options[field.XSS]] + '\n\n' +
            'Enter your name to join: ';

        if (options[field.XSS]) {
            next = XSS.stages.challenge;
        } else {
            next = XSS.stages.startGame;
        }

        stage = new InputStage('name', next, 'JOiN GAME', label);

        stage.minChars = 2;
        stage.maxValWidth = XSS.UI_WIDTH_NAME;

        return stage;
    },

    /**
     * @return {FormStage}
     */
    multiplayer: function() {
        var form, next, field = XSS.map.FIELD, value = XSS.map.VALUE;

        next = function(values) {
            if (values[field.XSS]) {
                return XSS.stages.challenge;
            }
            return XSS.stages.startGame;
        };

        form = new Form('GAME OPTIONS', next);

        form.addField(field.DIFFICULTY, 'LEVEL DIFFICULTY', [
            [value.MEDIUM, 'SNAKE'],
            [value.HARD, 'PYTHON'],
            [value.EASY, 'WORM']
        ]);

        form.addField(field.POWERUPS, 'POWER-UPS', [
            [true, 'YES'],
            [false, 'NO']
        ]);

        // Trololol
        form.addField('', 'WEIRD BUGS', [
            ['YES'],
            ['OK'],
            ['TRUE'],
            ['ACCEPT'],
            ['ENABLE'],
            ['HAO'],
            ['OUI!']
        ]);

        form.addField(field.PRIVATE, 'PRIVATE', [
            [false, 'NO'],
            [true, 'YES']
        ]);

        form.addField(field.XSS, 'XSS ' + XSS.UC_SKULL, [
            [false, 'NO'],
            [true, 'YES']
        ]);

        form.addField(field.MAX_PLAYERS, 'MAX PLAYERS', [
            [6],
            [1],
            [2],
            [3],
            [4],
            [5]
        ]);

        return new FormStage(form);
    },

    /**
     * @return {InputStage}
     */
    challenge: function() {
        var challenges, challenge, intro, stage, str, digit,
            nextstage = XSS.stages.inputXSS;

        str = XSS.util.randomStr().substr(0, 3).toUpperCase();
        digit = String(XSS.util.randomBetween(0, 5));

        challenges = [
            'document.scripts[0].tagName',
            'document.documentElement.tagName',
            'location.protocol.split(\'\').reverse().join()[0]',
            '\'ouimerci!\'.charAt(Math.ceil(Math.random())*%d)',
            'Array(%d).join(encodeURI(\' \'))',
            'String(parseInt(\'FF\', 16))',
            'JSON.stringify({A:\'%s\'})',
            'String([1,2,3][3]).charAt(%d)',
            'String(typeof []).charAt(%d)',
            'String(typeof (5%2)).charAt(%d)',
            'String(/%s/.test(\'%s\'))',
            '\'%s%s\'.replace(/%s/, \'mew\')',
            '\'012345\'.lastIndexOf(\'%d\')',
            '\'%s\'+\'A\'+Math.pow(%d,2)',
            'String(new Date(\'2013-0%d-0%d\').getMonth())',
            'var A=%d,B=3;do{A++}while(B--); A;',
            'var A=3,B=%d;do{A++}while(B--); B;',
            'var A=%d;A++;++A;A+=1; A;',
            'var A=%d;A--;--A;A-=1; A;'
        ];

        challenge = String(XSS.util.randomItem(challenges));
        challenge = challenge.replace(/%s/g, str);
        challenge = challenge.replace(/%d/g, digit);

        intro = 'XSS mode allows the winner of a game to execute\n' +
                'Javascript in the browser of every loser. This may\n' +
                'damage you and/or your computer. To confirm that\n' +
                'you know Javascript and accept the risk, enter the\n' +
                'result of this statement:\n\n> ' +
                challenge + '\n> ';

        stage = new InputStage(null, nextstage, 'DANGER DANGER', intro);
        stage.maxValWidth = 50;
        stage.inputSubmit = function(error, value, top) {
            XSS.stages._challengeSubmit.call(stage, value, challenge, top);
        };

        return stage;
    },

    /**
     * @return {InputStage}
     */
    inputXSS: function() {
        var stage, intro, next = XSS.stages.startGame;

        intro = 'Paste your JS. Keep it short; max 128 chars.\n' +
                'Line breaks will be removed.\n\n' +
                '> ';

        stage = new InputStage('xurl', next, 'ENTER XSS', intro);
        stage.minChars = 2;
        stage.maxChars = 128;
        stage.displayWidth = XSS.MENU_WIDTH - XSS.font.width('> ');

        if (!stage.val) {
            stage.val = 'window.alert("LOSERRRRR");';
        }

        return stage;
    },

    /**
     * @return {SelectStage}
     */
    colorScheme: function() {
        var setTheme, menu = new SelectMenu('scheme', 'COLOR SCHEME');

        menu.selected = XSS.util.storage(XSS.STORAGE_SCHEME);
        menu.selected = parseInt(menu.selected, 10) || 0;

        setTheme = function(index) {
            XSS.canvas.setScheme(XSS.schemes[index]);
            XSS.util.storage(XSS.STORAGE_SCHEME, index);
        };

        for (var i = 0, m = XSS.schemes.length; i < m; i++) {
            var title = XSS.schemes[i].title,
                desc = XSS.schemes[i].desc;
            menu.addOption(true, null, title, desc, setTheme);
        }

        return new SelectStage(menu);
    },

    /**
     * @return {ScreenStage}
     */
    credits: function() {
        var screen, left, top;

        left = XSS.MENU_LEFT;
        top = XSS.MENU_TOP;

        screen = new Shape(
            XSS.transform.zoomX2(XSS.font.pixels('CREDITS'), left, top, true),
            XSS.font.pixels('' +
                'Concept, Code, Bugs, Font & ' + XSS.UC_SKULL + ':\n' +
                'Blaise Kal, 2012-2013.\n\n' +
                'Website: www.blaise.io\n' +
                'Email: blaisekal@gmail.com\n\n' +
                'Thank you for playing!', left, top + XSS.MENU_TITLE_HEIGHT)
        );

        return new ScreenStage(screen);
    },

    /**
     * @return {InputStage}
     */
    inputName: function() {
        var stage, next = XSS.stages.multiplayer;

        stage = new InputStage('name', next, 'HELLO', 'My name is ');

        stage.minChars = 2;
        stage.maxValWidth = XSS.UI_WIDTH_NAME;
        stage.inputSubmit = XSS.stages._inputNameSubmit;

        return stage;
    },

    /**
     * @return {GameStage}
     */
    startGame: function() {
        return new GameStage();
    },

    /**
     * @param {string} value
     * @param {string} challenge
     * @param {number} top
     * @this {InputStage}
     * @private
     */
    _challengeSubmit: function(value, challenge, top) {
        var shape, text = '> ACCESS DENIED!!';

        if (value.replace(/['"]/g, '') === String(eval(challenge))) { // 666
            text = '> bleep!';
            setTimeout(function() {
                XSS.flow.switchStage(this.nextStage);
            }.bind(this), 1000);
        }

        shape = XSS.font.shape(
            text,
            XSS.MENU_LEFT,
            top
        );
        shape.lifetime(0, 1000);
        XSS.shapes.message = shape;
    },

    /**
     * @param {string} error
     * @param {string} value
     * @param {number} top
     * @this {InputStage}
     * @private
     */
    _inputNameSubmit: function(error, value, top) {
        var wits, shape, text, duration = 500;

        wits = [
            '%s%s%s',
            'You have the same name as my mom',
            'LOVELY ' + new Array(4).join(XSS.UC_HEART),
            XSS.UC_SKULL,
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
            text = XSS.util.randomItem(wits);
            text = text.replace(/%s/g, value);
            duration = Math.max(text.length * 30, 300);
            setTimeout(function() {
                XSS.flow.switchStage(this.nextStage);
            }.bind(this), duration + 50);
        }

        shape = XSS.font.shape(
            text,
            XSS.MENU_LEFT,
            top
        );
        shape.lifetime(0, duration);
        XSS.shapes.message = shape;
    }

};
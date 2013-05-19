/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS */
'use strict';

/** @const */ XSS.WIDTH = 256;
/** @const */ XSS.HEIGHT = 161;

/** @const */ XSS.MIN_FRAME_DELTA = 5;
/** @const */ XSS.MAX_FRAME_DELTA = 250;

/** @const */ XSS.UI_WIDTH_NAME = 40;

/** @const */ XSS.KEY_BACKSPACE = 8;
/** @const */ XSS.KEY_TAB = 9;
/** @const */ XSS.KEY_ENTER = 13;
/** @const */ XSS.KEY_ESCAPE = 27;
/** @const */ XSS.KEY_LEFT = 37;
/** @const */ XSS.KEY_UP = 38;
/** @const */ XSS.KEY_RIGHT = 39;
/** @const */ XSS.KEY_DOWN = 40;
/** @const */ XSS.KEY_MUTE = 77; // M
/** @const */ XSS.KEY_START = 83; // S

/** @const */ XSS.DIRECTION_LEFT = 0;
/** @const */ XSS.DIRECTION_UP = 1;
/** @const */ XSS.DIRECTION_RIGHT = 2;
/** @const */ XSS.DIRECTION_DOWN = 3;

/** @const */ XSS.MENU_LEFT = 42;
/** @const */ XSS.MENU_TOP = 48;
/** @const */ XSS.MENU_WIDTH = 167;
/** @const */ XSS.MENU_WRAP = 176;
/** @const */ XSS.MENU_TITLE_HEIGHT = 20;

/** @const */ XSS.GAME_LEFT = 2;
/** @const */ XSS.GAME_TOP = 2;
/** @const */ XSS.GAME_TILE = 4;

/** @const */ XSS.HASH_ROOM = 'room';

/** @const */ XSS.NS_FLOW = 'FLW';
/** @const */ XSS.NS_SCORE = 'SCR';
/** @const */ XSS.NS_CHAT = 'CHT';
/** @const */ XSS.NS_GAME = 'GAM';
/** @const */ XSS.NS_ROOM = 'ROM';
/** @const */ XSS.NS_SOCKET = 'SOK';
/** @const */ XSS.NS_SNAKE = 'SNK';
/** @const */ XSS.NS_SPAWN = 'SPN';
/** @const */ XSS.NS_STAGES = 'STG';

/** @const */ XSS.PUB_GAME_TICK = 'TIK';
/** @const */ XSS.PUB_FOCUS_CHANGE = 'FCH';
/** @const */ XSS.PUB_FONT_LOAD = 'FLD';

/** @const */ XSS.STORAGE_MUTE = 'MUT';
/** @const */ XSS.STORAGE_NAME = 'NME';
/** @const */ XSS.STORAGE_COLOR = 'CLR';

/** @const */ XSS.UC_ARR_LEFT = '\u2190';
/** @const */ XSS.UC_ARR_UP = '\u2191';
/** @const */ XSS.UC_ARR_RIGHT = '\u2192';
/** @const */ XSS.UC_ARR_DOWN = '\u2193';
/** @const */ XSS.UC_ELECTRIC = '\u2301';
/** @const */ XSS.UC_HOURGLASS = '\u231B';
/** @const */ XSS.UC_ENTER_KEY = '\u23ce';
/** @const */ XSS.UC_SQUARE = '\u25a0';
/** @const */ XSS.UC_TR_LEFT = '\u25c0';
/** @const */ XSS.UC_TR_RIGHT = '\u25b6';
/** @const */ XSS.UC_TR_UP = '\u25b2';
/** @const */ XSS.UC_TR_DOWN = '\u25bc';
/** @const */ XSS.UC_BULLSEYE = '\u25ce';
/** @const */ XSS.UC_SKULL = '\u2620';
/** @const */ XSS.UC_FROWNY_FACE = '\u2639';
/** @const */ XSS.UC_HAPPY_FACE = '\u263A';
/** @const */ XSS.UC_HEART = '\u2665';

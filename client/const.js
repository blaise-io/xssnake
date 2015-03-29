// Client-only extension of server/shared/const.js
xss.IS_CLIENT = true;

xss.FRAME = 1000 / 60;
xss.MIN_FRAME_DELTA = 5;
xss.MAX_FRAME_DELTA = 250;

xss.KEY_BACKSPACE = 8;
xss.KEY_TAB = 9;
xss.KEY_ENTER = 13;
xss.KEY_ESCAPE = 27;
xss.KEY_SPACE = 32;
xss.KEY_LEFT = 37;
xss.KEY_UP = 38;
xss.KEY_RIGHT = 39;
xss.KEY_DOWN = 40;
xss.KEY_FULLSCREEN = 70; // F key
xss.KEY_MUTE = 77; // M key
xss.KEY_START = 83; // S key

xss.FIELD_BUGS = -1;
xss.FIELD_NAME = 0;
xss.FIELD_QUICK_GAME = 1;
xss.FIELD_MAX_PLAYERS = 2;
xss.FIELD_LEVEL_SET = 3;
xss.FIELD_POWERUPS = 4;
xss.FIELD_PRIVATE = 5;
xss.FIELD_XSS = 6;

xss.KEY_TO_DIRECTION = [];
xss.KEY_TO_DIRECTION[xss.KEY_LEFT] = xss.DIRECTION_LEFT;
xss.KEY_TO_DIRECTION[xss.KEY_UP] = xss.DIRECTION_UP;
xss.KEY_TO_DIRECTION[xss.KEY_RIGHT] = xss.DIRECTION_RIGHT;
xss.KEY_TO_DIRECTION[xss.KEY_DOWN] = xss.DIRECTION_DOWN;

xss.GAME_LEFT = 2;
xss.GAME_TOP = 2;

xss.MENU_LEFT = 44;
xss.MENU_TOP = 48;
xss.MENU_WIDTH = 167;
xss.MENU_WRAP = 176;
xss.MENU_TITLE_HEIGHT = 20;

xss.DOM_EVENT_KEYPRESS = 'keypress';
xss.DOM_EVENT_KEYDOWN = 'keydown';
xss.DOM_EVENT_KEYUP = 'keyup';

xss.HASH_ROOM = 'room';

xss.NS_DEBUG = 'DEBUG';
xss.NS_ANIM = 'ANM';
xss.NS_ACTION = 'ACT';
xss.NS_BETWEEN_GAME = 'BGM';
xss.NS_EXPLOSION = 'EXPL';
xss.NS_FLOW = 'FLW';
xss.NS_CHAT = 'CHT';
xss.NS_DIALOG = 'DLG';
xss.NS_INPUT = 'INP';
xss.NS_GAME = 'GAM';
xss.NS_MSGBOX = 'MSG';
xss.NS_ROOM = 'ROM';
xss.NS_ROUND = 'RND';
xss.NS_ROUND_SET = 'RST';
xss.NS_PRE_GAME = 'PGM';
xss.NS_SCORE = 'SCR';
xss.NS_SNAKE = 'SNK';
xss.NS_SNAKE_CONTROLS = 'SNKC';
xss.NS_HEARTBEAT = 'HBT';
xss.NS_SOCKET = 'SOK';
xss.NS_SPAWN = 'SPN';
xss.NS_STAGES = 'STG';

xss.EV_GAME_TICK = 'TIK';
xss.EV_WIN_FOCUS_CHANGE = 'WFC';
xss.EV_FONT_LOAD = 'FLD';
xss.EV_PLAYERS_UPDATED = 'PU';

xss.STORAGE_MUTE = 'MUT';
xss.STORAGE_NAME = 'NME';
xss.STORAGE_XSS = 'XSS';
xss.STORAGE_COLOR = 'CLR';
xss.STORAGE_PREFS = 'PRF';

xss.UC_ARR_LEFT = '\u2190';
xss.UC_ARR_UP = '\u2191';
xss.UC_ARR_RIGHT = '\u2192';
xss.UC_ARR_DOWN = '\u2193';
xss.UC_CODE = '\u2263';
xss.UC_ELECTRIC = '\u2301';
xss.UC_HOURGLASS = '\u231B';
xss.UC_ENTER_KEY = '\u23ce';
xss.UC_SQUARE = '\u25a0';
xss.UC_TR_LEFT = '\u25c0';
xss.UC_TR_RIGHT = '\u25b6';
xss.UC_TR_UP = '\u25b2';
xss.UC_TR_DOWN = '\u25bc';
xss.UC_APPLE = '\u25ce'; // Bullseye
xss.UC_SKULL = '\u2620';
xss.UC_FROWNY_FACE = '\u2639';
xss.UC_HAPPY_FACE = '\u263A';
xss.UC_WHITE_HEART = '\u2661';
xss.UC_BLACK_HEART = '\u2665';
xss.UC_MUSIC = '\u266b';
xss.UC_YES = '\u2714';
xss.UC_NO = '\u2717';
xss.UC_BULB = '\u2800'; // Braille range.
xss.UC_BUG = '\u2801';
xss.UC_FONT = '\u2802';
xss.UC_LOCK = '\u2803';

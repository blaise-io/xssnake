// Client-only extension of server/shared/const.js
import { DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP } from "../shared/const";

export const FRAME = 1000 / 60;
export const MIN_FRAME_DELTA = 5;
export const MAX_FRAME_DELTA = 250;

export const KEY_BACKSPACE = 8;
export const KEY_TAB = 9;
export const KEY_ENTER = 13;
export const KEY_ESCAPE = 27;
export const KEY_SPACE = 32;
export const KEY_LEFT = 37;
export const KEY_UP = 38;
export const KEY_RIGHT = 39;
export const KEY_DOWN = 40;
export const KEY_FULLSCREEN = 70; // F key
export const KEY_MUTE = 77; // M key
export const KEY_START = 83; // S key

export const FIELD_BUGS = -1;
export const FIELD_NAME = 0;
export const FIELD_QUICK_GAME = 1;
export const FIELD_MAX_PLAYERS = 2;
export const FIELD_LEVEL_SET = 3;
export const FIELD_POWERUPS = 4;
export const FIELD_PRIVATE = 5;
export const FIELD_XSS = 6;

export const KEY_TO_DIRECTION = [];
KEY_TO_DIRECTION[KEY_LEFT] = DIRECTION_LEFT;
KEY_TO_DIRECTION[KEY_UP] = DIRECTION_UP;
KEY_TO_DIRECTION[KEY_RIGHT] = DIRECTION_RIGHT;
KEY_TO_DIRECTION[KEY_DOWN] = DIRECTION_DOWN;

export const GAME_LEFT = 2;
export const GAME_TOP = 2;

export const MENU_LEFT = 44;
export const MENU_TOP = 48;
export const MENU_WIDTH = 167;
export const MENU_WRAP = 176;
export const MENU_TITLE_HEIGHT = 20;

export const DOM_EVENT_KEYPRESS = "keypress";
export const DOM_EVENT_KEYDOWN = "keydown";
export const DOM_EVENT_KEYUP = "keyup";

export const HASH_ROOM = "room";

export const NS_DEBUG = "DEBUG";
export const NS_ANIM = "ANM";
export const NS_ACTION = "ACT";
export const NS_BETWEEN_GAME = "BGM";
export const NS_EXPLOSION = "EXPL";
export const NS_FLOW = "FLW";
export const NS_CHAT = "CHT";
export const NS_DIALOG = "DLG";
export const NS_INPUT = "INP";
export const NS_GAME = "GAM";
export const NS_MSGBOX = "MSG";
export const NS_ROOM = "ROM";
export const NS_ROUND = "RND";
export const NS_ROUND_SET = "RST";
export const NS_PRE_GAME = "PGM";
export const NS_SCORE = "SCR";
export const NS_SNAKE = "SNK";
export const NS_SNAKE_CONTROLS = "SNKC";
export const NS_HEARTBEAT = "HBT";
export const NS_SOCKET = "SOK";
export const NS_SPAWN = "SPN";
export const NS_STAGES = "STG";

export const EV_GAME_TICK = "TIK";
export const EV_WIN_FOCUS_CHANGE = "WFC";
export const EV_FONT_LOAD = "FLD";
export const EV_PLAYERS_UPDATED = "PU";

export const STORAGE_MUTE = "MUT";
export const STORAGE_NAME = "NME";
export const STORAGE_XSS = "XSS";
export const STORAGE_COLOR = "CLR";
export const STORAGE_PREFS = "PRF";

export const UC_ARR_LEFT = "\u2190";
export const UC_ARR_UP = "\u2191";
export const UC_ARR_RIGHT = "\u2192";
export const UC_ARR_DOWN = "\u2193";
export const UC_CODE = "\u2263";
export const UC_ELECTRIC = "\u2301";
export const UC_HOURGLASS = "\u231B";
export const UC_ENTER_KEY = "\u23ce";
export const UC_SQUARE = "\u25a0";
export const UC_TR_LEFT = "\u25c0";
export const UC_TR_RIGHT = "\u25b6";
export const UC_TR_UP = "\u25b2";
export const UC_TR_DOWN = "\u25bc";
export const UC_APPLE = "\u25ce"; // Bullseye
export const UC_SKULL = "\u2620";
export const UC_FROWNY_FACE = "\u2639";
export const UC_HAPPY_FACE = "\u263A";
export const UC_WHITE_HEART = "\u2661";
export const UC_BLACK_HEART = "\u2665";
export const UC_MUSIC = "\u266b";
export const UC_YES = "\u2714";
export const UC_NO = "\u2717";
export const UC_BULB = "\u2800"; // Braille range.
export const UC_BUG = "\u2801";
export const UC_FONT = "\u2802";
export const UC_LOCK = "\u2803";

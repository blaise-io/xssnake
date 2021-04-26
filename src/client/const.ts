// Client-only extension of server/shared/const.js
import { DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP } from "../shared/const";

export const FRAME = 1000 / 60;
export const MIN_FRAME_DELTA = 5;
export const MAX_FRAME_DELTA = 250;

// TODO: Switch to event.code?
export const enum KEY {
    BACKSPACE = 8,
    TAB = 9,
    ENTER = 13,
    ESCAPE = 27,
    SPACE = 32,
    LEFT = 37,
    UP = 38,
    RIGHT = 39,
    DOWN = 40,
    FULLSCREEN = 70, // F key
    MUTE = 77, // M key
    START = 83, // S key
}

export const FIELD_BUGS = -1;
export const FIELD_NAME = 0;
export const FIELD_QUICK_GAME = 1;
export const FIELD_MAX_PLAYERS = 2;
export const FIELD_LEVEL_SET = 3;
export const FIELD_POWERUPS = 4;
export const FIELD_PRIVATE = 5;
export const FIELD_XSS = 6;

export const KEY_TO_DIRECTION = {};
KEY_TO_DIRECTION[KEY.LEFT] = DIRECTION_LEFT;
KEY_TO_DIRECTION[KEY.UP] = DIRECTION_UP;
KEY_TO_DIRECTION[KEY.RIGHT] = DIRECTION_RIGHT;
KEY_TO_DIRECTION[KEY.DOWN] = DIRECTION_DOWN;

export const MENU_LEFT = 44;
export const MENU_TOP = 48;
export const MENU_WIDTH = 167;
export const MENU_WRAP = 176;
export const MENU_TITLE_HEIGHT = 20;

export const HASH_ROOM = "room";

export const enum NS {
    DEBUG = "DEBUG",
    ANIM = "ANM",
    ACTION = "ACT",
    BETWEEN_GAME = "BGM",
    EXPLOSION = "EXPL",
    FLOW = "FLW",
    CHAT = "CHT",
    DIALOG = "DLG",
    INPUT = "INP",
    GAME = "GAM",
    MSGBOX = "MSG",
    ROOM = "ROM",
    ROUND = "RND",
    ROUND_SET = "RST",
    PRE_GAME = "PGM",
    SCORE = "SCR",
    SNAKE = "SNK",
    SNAKE_CONTROLS = "SNKC",
    HEARTBEAT = "HBT",
    SOCKET = "SOK",
    SPAWN = "SPN",
    STAGES = "STG",
}
export const EV_GAME_TICK = "TIK";
export const EV_WIN_FOCUS_CHANGE = "WFC";
export const EV_FONT_LOAD = "FLD";
export const EV_PLAYERS_UPDATED = "PU";

export const STORAGE_MUTE = "MUT";
export const STORAGE_NAME = "NME";
export const STORAGE_XSS = "XSS";
export const STORAGE_COLOR = "CLR";
export const STORAGE_PREFS = "PRF";

export const enum UC {
    ARR_LEFT = "\u2190",
    ARR_UP = "\u2191",
    ARR_RIGHT = "\u2192",
    ARR_DOWN = "\u2193",
    CODE = "\u2263",
    ELECTRIC = "\u2301",
    HOURGLASS = "\u231B",
    ENTER_KEY = "\u23ce",
    SQUARE = "\u25a0",
    TR_LEFT = "\u25c0",
    TR_RIGHT = "\u25b6",
    TR_UP = "\u25b2",
    TR_DOWN = "\u25bc",
    APPLE = "\u25ce", // Bullseye
    SKULL = "\u2620",
    FROWNY_FACE = "\u2639",
    HAPPY_FACE = "\u263A",
    WHITE_HEART = "\u2661",
    BLACK_HEART = "\u2665",
    MUSIC = "\u266b",
    YES = "\u2714",
    NO = "\u2717",
    BULB = "\u2800", // Braille range.
    BUG = "\u2801",
    FONT = "\u2802",
    LOCK = "\u2803",
}

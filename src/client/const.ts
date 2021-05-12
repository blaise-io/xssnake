// Client-only extension of server/shared/const.js

export const FRAME = 1000 / 60;
export const MIN_FRAME_DELTA = FRAME / 2;
export const MAX_FRAME_DELTA = FRAME * 15;

// Corresponds with Event.key.
// TODO: Use Event.code?
export const enum KEY {
    BACKSPACE = "Backspace",
    TAB = "Tab",
    ENTER = "Enter",
    ESCAPE = "Escape",
    SPACE = " ",
    LEFT = "ArrowLeft",
    UP = "ArrowUp",
    RIGHT = "ArrowRight",
    DOWN = "ArrowDown",
    FULLSCREEN = "f",
    MUTE = "m",
    START = "s",
}

export const enum MENU_POS {
    LEFT = 44,
    TOP = 48,
    WIDTH = 167,
    WRAP = 176,
    TITLE_HEIGHT = 20,
}

export const enum HASH {
    ROOM = "room",
}

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

export const enum STORAGE {
    NO_STORE = "",
    MUTE = "mute",
    NAME = "name",
    XSS = "xss",
    COLOR = "color",
}

// https://fontstruct.com/fontstructor/edit/740547
// enable Expert Mode, then Menu / View / Advanced / Unicode Letter Sets
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

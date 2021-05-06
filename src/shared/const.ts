export const enum CANVAS {
    WIDTH = 256, // index-based, so 0-255 is in viewport.
    HEIGHT = 161, // index-based, so 0-160 is in viewport.
}

export const enum LEVEL {
    WIDTH = 63,
    HEIGHT = 33,
}

export const enum GAME {
    TILE = 4,
    LEFT = 2,
    TOP = 2,
}

/** @deprecated: Use Message */ export const NC_ROUND_WRAPUP = 53;
/** @deprecated: Use Message */ export const NC_SCORE_UPDATE = 60;
/** @deprecated: Use Message */ export const NC_SNAKE_CRASH = 71;
/** @deprecated: Use Message */ export const SE_PLAYER_COLLISION = 102;

export const enum SERVER_EVENT {
    PLAYER_DISCONNECT = "SE0",
    PLAYER_COLLISION = "SE1",
}

export const HEARTBEAT_INTERVAL_MS = 5000;

export const GAME_SHIFT_MAP = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
];

export const enum DIRECTION {
    LEFT,
    UP,
    RIGHT,
    DOWN,
}

export const enum ORIENTATION {
    HORIZONTAL,
    VERTICAL,
}

export const ROOM_KEY_LENGTH = 5;
export const ROOM_CAPACITY = 6;
export const ROUNDS_MAX = 3;
export const ROOM_WIN_BY_MIN = 2;

export const PLAYER_NAME_MINLENGTH = 1;
export const PLAYER_NAME_MAXWIDTH = 36;

export const SECONDS_ROUND_PAUSE = 3;
export const SECONDS_ROUND_GLOAT = 5;
export const SECONDS_ROUNDSET_GLOAT = 10;
export const SECONDS_ROUND_COUNTDOWN = 3;

export const SPAWN_SOMETHING_EVERY = [20, 60];
export const SPAWN_CHANCE_APPLE = 0.9;

export const SNAKE_SPEED = 120;
export const SNAKE_SIZE = 4;

export const FIELD_VALUE_EASY = 1;
export const FIELD_VALUE_MEDIUM = 2;
export const FIELD_VALUE_HARD = 3;

export const enum ROOM_STATUS {
    JOINABLE,
    INVALID_KEY,
    FULL,
    NOT_FOUND,
    IN_PROGRESS,
    UNKNOWN_ERROR,
}

export const CRASH_UNKNOWN = 0;
export const CRASH_WALL = 1;
export const CRASH_MOVING_WALL = 2;
export const CRASH_SELF = 3;
export const CRASH_OPPONENT = 4;
export const CRASH_OPPONENT_DRAW = 5;

export const NETCODE_PING_INTERVAL = 3000;
export const NETCODE_SYNC_MS = 500;

export const VALIDATE_SUCCES = 0;
export const VALIDATE_ERR_GAP = 1;
export const VALIDATE_ERR_NO_COMMON = 2;
export const VALIDATE_ERR_MISMATCHES = 3;

export const SCORE_LEADING = 1;
export const SCORE_NEUTRAL = 2;
export const SCORE_BEHIND = 3;

export const SPAWN_APPLE = 1;
export const SPAWN_POWERUP = 2;

export const NOTICE_CRASH = 1;
export const NOTICE_JOIN = 2;
export const NOTICE_DISCONNECT = 3;
export const NOTICE_NEW_ROUND = 4;

/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals CONST:true*/
'use strict';

/** @lends CONST */
module.exports = {

    EVENT_COMBI         : 'C',
    EVENT_CHAT_NOTICE   : 'CN',
    EVENT_CHAT_MESSAGE  : 'CM',
    EVENT_GAME_COUNTDOWN: 'GC',
    EVENT_GAME_DESPAWN  : 'GD',
    EVENT_GAME_START    : 'GS',
    EVENT_GAME_STATE    : 'GS2',
    EVENT_GAME_SPAWN    : 'GS3',
    EVENT_PING          : 'P',
    EVENT_PONG          : 'PP',
    EVENT_ROOM_JOIN     : 'RJ',
    EVENT_ROOM_MATCH    : 'RM',
    EVENT_ROOM_INDEX    : 'RI',
    EVENT_ROOM_START    : 'RS',
    EVENT_ROOM_STATUS   : 'RS2',
    EVENT_SCORE_UPDATE  : 'SU',
    EVENT_SNAKE_ACTION  : 'SA',
    EVENT_SNAKE_CRASH   : 'SC',
    EVENT_SNAKE_SIZE    : 'SS',
    EVENT_SNAKE_SPEED   : 'SS2',
    EVENT_SNAKE_UPDATE  : 'S',

    ROOM_CAPACITY  : 6,
    ROOM_ROUNDS    : 3,
    ROOM_WIN_BY_MIN: 2,

    TIME_GLOAT         : 5,
    TIME_COUNTDOWN_FROM: 3,

    SPAWN_SOMETHING_EVERY: [10, 30],
    SPAWN_CHANCE_APPLE   : 0.9,

    SNAKE_SPEED: 120,
    SNAKE_SIZE : 4,

    FIELD_NAME       : 'NM',
    FIELD_MAX_PLAYERS: 'MP',
    FIELD_DIFFICULTY : 'LD',
    FIELD_POWERUPS   : 'PU',
    FIELD_PRIVATE    : 'PV',
    FIELD_XSS        : 'XS',

    FIELD_VALUE_EASY  : 1,
    FIELD_VALUE_MEDIUM: 2,
    FIELD_VALUE_HARD  : 3,

    ROOM_INVALID    : 1,
    ROOM_FULL       : 2,
    ROOM_NOT_FOUND  : 3,
    ROOM_IN_PROGRESS: 4,

    CRASH_WALL         : 1,
    CRASH_SELF         : 2,
    CRASH_OPPONENT     : 3,
    CRASH_OPPONENT_DRAW: 4,

    NETCODE_PING_INTERVAL: 3000,
    NETCODE_SYNC_MS      : 500,

    SPAWN_APPLE  : 1,
    SPAWN_POWERUP: 2,

    NOTICE_CRASH    : 1,
    NOTICE_JOIN     : 2,
    NOTICE_LEAVE    : 3,
    NOTICE_NEW_ROUND: 4

};

if (typeof XSS !== 'undefined') {
    CONST = module.exports;
}

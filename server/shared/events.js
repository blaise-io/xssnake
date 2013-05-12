/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals XSS*/
'use strict';

// Event keys are hard-coded and unique.
module.exports = {

    CHAT_NOTICE      : 'CHAT_NOTICE',
    CHAT_MESSAGE     : 'CHAT_MESSAGE',
    COMBI            : 'COMBI',
    GAME_COUNTDOWN   : 'GAME_COUNTDOWN',
    GAME_START       : 'GAME_START',
    GAME_STATE       : 'GAME_STATE',
    PING             : 'PING',
    PONG             : 'PONG',
    ROOM_JOIN        : 'ROOM_JOIN',
    ROOM_MATCH       : 'ROOM_MATCH',
    ROOM_INDEX       : 'ROOM_INDEX',
    ROOM_START       : 'ROOM_START',
    ROOM_STATUS      : 'ROOM_STATUS',
    SCORE_UPDATE     : 'SCORE_UPDATE',
    GAME_SPAWN       : 'GAME_SPAWN',
    GAME_SPAWN_HIT   : 'GAME_SPAWN_HIT',
    GAME_SNAKE_ACTION: 'GAME_SNAKE_ACTION',
    GAME_SNAKE_CRASH : 'GAME_SNAKE_CRASH',
    GAME_SNAKE_SIZE  : 'GAME_SNAKE_SIZE',
    GAME_SNAKE_SPEED : 'GAME_GAME_SNAKE_SPEED',
    GAME_SNAKE_UPDATE: 'GAME_SNAKE_UPDATE'

};

if (typeof XSS !== 'undefined') {
    XSS.events = module.exports;
}

/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals XSS*/
'use strict';

module.exports = {
    SERVER_PORT        : 80,
    SERVER_ENDPOINT    : 'http://localhost/xssnake',

    ROOM_CAPACITY      : 6,
    ROOM_ROUNDS        : 3,
    ROOM_WIN_BY_MIN    : 2,

    TIME_GLOAT         : 5,
    TIME_COUNTDOWN_FROM: 3,
    TIME_RESPAWN_APPLE : 30,
    TIME_SPAWN_POWERUP : [5, 30],

    SNAKE_SPEED        : 120,
    SNAKE_SIZE         : 4
};

if (typeof XSS !== 'undefined') {
    XSS.config = module.exports;
}

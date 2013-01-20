/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals XSS*/
'use strict';

module.exports = {
    SERVER_PORT        : 80,
    SERVER_ENDPOINT    : 'http://localhost:80',
    SOCKET_IO_JS       : 'http://localhost:80/socket.io/socket.io.js',

    ROOM_CAPACITY      : 6,

    TIME_GLOAT         : 5,
    TIME_COUNTDOWN_FROM: 3,
    TIME_RESPAWN_APPLE : 30,
    TIME_SPAWN_POWERUP : [5, 30],

    SNAKE_SPEED        : 150,
    SNAKE_SIZE         : 4
};

if (typeof XSS !== 'undefined') {
    XSS.config = module.exports;
}
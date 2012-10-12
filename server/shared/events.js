/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

module.exports = {
    CLIENT_CONNECT     : 'CONN',
    CLIENT_NOTICE      : 'NOTICE',
    CLIENT_GAME_SETUP  : 'SETUP',
    CLIENT_GAME_START  : 'START',
    CLIENT_GAME_WIN    : 'WIN',
    CLIENT_SNAKE_UPDATE: 'CSN',
    CLIENT_SNAKE_CRASH : 'CRASH',
    CLIENT_APPLE_NOM   : 'NOM',
    CLIENT_APPLE_SPAWN : 'GROW',

    SERVER_ROOM_MATCH  : 'ROOM',
    SERVER_CHAT_MESSAGE: 'CHAT',
    SERVER_SNAKE_UPDATE: 'SSN'
};

if (typeof XSS !== 'undefined') {
    XSS.events = module.exports;
}

console.log(event)
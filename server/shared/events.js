/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

module.exports = {
    CLIENT_CONNECT     : 'CCO',
    CLIENT_NOTICE      : 'NNO',

    CLIENT_CHAT_MESSAGE: 'CCM',
    CLIENT_GAME_SETUP  : 'CGS',
    CLIENT_GAME_START  : 'CG2',
    CLIENT_GAME_WIN    : 'CGW',
    CLIENT_SNAKE_UPDATE: 'CSU',
    CLIENT_SNAKE_CRASH : 'CSN',
    CLIENT_APPLE_NOM   : 'CAN',
    CLIENT_APPLE_SPAWN : 'CAS',

    SERVER_ROOM_MATCH  : 'SRM',
    SERVER_CHAT_MESSAGE: 'SCM',
    SERVER_SNAKE_UPDATE: 'SSU',
    SERVER_GAME_REINDEX: 'SGR'
};

if (typeof XSS !== 'undefined') {
    XSS.events = module.exports;
}
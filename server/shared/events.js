/*jshint globalstrict:true, es5:true, node:true*/
/*globals XSS*/

'use strict';

module.exports = {
    CLIENT_CONNECT       : 'CCO',

    CLIENT_ROOM_JOIN     : 'CRJ',
    CLIENT_ROOM_INDEX    : 'CRI',
    CLIENT_ROOM_SCORE    : 'CRS',
    CLIENT_CHAT_NOTICE   : 'CCN',
    CLIENT_CHAT_MESSAGE  : 'CCM',
    CLIENT_GAME_COUNTDOWN: 'CGS',
    CLIENT_GAME_START    : 'CG2',
    CLIENT_SNAKE_UPDATE  : 'CSU',
    CLIENT_SNAKE_CRASH   : 'CSN',
    CLIENT_APPLE_NOM     : 'CAN',
    CLIENT_APPLE_SPAWN   : 'CAS',

    SERVER_ROOM_MATCH    : 'SRM',
    SERVER_CHAT_MESSAGE  : 'SCM',
    SERVER_SNAKE_UPDATE  : 'SSU',
    SERVER_GAME_STATE    : 'SGS'
};

if (typeof XSS !== 'undefined') {
    XSS.events = module.exports;
}
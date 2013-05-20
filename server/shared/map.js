/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals XSS*/
'use strict';

module.exports = {

    FIELD: {
        NAME       : 'NM',
        MAX_PLAYERS: 'MP',
        DIFFICULTY : 'LD',
        POWERUPS   : 'PU',
        PRIVATE    : 'PV',
        XSS        : 'XS'
    },

    VALUE: {
        EASY  : 1,
        MEDIUM: 2,
        HARD  : 3
    },

    ROOM: {
        INVALID    : 1,
        FULL       : 2,
        NOT_FOUND  : 3,
        IN_PROGRESS: 4
    },

    SPAWN_APPLE  : 0,
    SPAWN_POWERUP: 1

};

if (typeof XSS !== 'undefined') {
    XSS.map = module.exports;
}

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
        FULL       : 1,
        NOT_FOUND  : 2,
        IN_PROGRESS: 3
    }

};

if (typeof XSS !== 'undefined') {
    XSS.map = module.exports;
}
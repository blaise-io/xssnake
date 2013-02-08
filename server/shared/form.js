/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals XSS*/
'use strict';

// Values and fields are hard-coded and unique.
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
    }

};

if (typeof XSS !== 'undefined') {
    XSS.form = module.exports;
}
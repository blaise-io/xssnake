/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals XSS*/
'use strict';

// Values and fields are hard-coded and unique.
module.exports = {

    FIELD: {
        MAX_PLAYERS     : 'MP',
        LEVEL_DIFFICULTY: 'LD',
        POWERUPS        : 'PU',
        PRIVATE         : 'PV',
        XSS             : 'XS'
    },

    VALUE: {
        NO    : 0,
        YES   : 1,
        ANY   : 2,
        EASY  : 3,
        MEDIUM: 4,
        HARD  : 5
    }

};

if (typeof XSS !== 'undefined') {
    XSS.form = module.exports;
}
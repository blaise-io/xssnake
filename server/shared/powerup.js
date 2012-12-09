/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

/**
 * Snake
 * @param {Array.<number>} location
 * @constructor
 */
function Powerup(location) {
    this.location = [location];
    this.typeID = this.getRandomType();
}

if (typeof module !== 'undefined') {
    module.exports = Powerup;
}

/** @const */ Powerup.APPLY_SELF = 0;
/** @const */ Powerup.APPLY_OTHERS = 1;
/** @const */ Powerup.APPLY_EITHER = 2;
/** @const */ Powerup.APPLY_ALL = 3;

/** @const */ Powerup.ACTION_SPEED = 0;
/** @const */ Powerup.ACTION_SIZE = 1;
/** @const */ Powerup.ACTION_INVINCIBILITY = 2;
/** @const */ Powerup.ACTION_APPLE_SPAWNS = 3;

Powerup.prototype = {

    getRandomType: function() {
        var m = this.types.length;
        return Math.floor(Math.random() * m);
    },

    getProperties: function() {
        return this.types[this.typeID];
    },

    types: [
        {
            title : 'Speed Boost',
            props : {speed: 100, duration: 5000},
            action: Powerup.ACTION_SPEED,
            odds  : [
                [6, Powerup.APPLY_SELF],
                [2, Powerup.APPLY_OTHERS],
                [2, Powerup.APPLY_ALL]
            ]
        },
        {
            title : 'Slowdown',
            props : {speed: -100, duration: 5000},
            action: Powerup.ACTION_SPEED,
            odds  : [
                [7, Powerup.APPLY_OTHERS],
                [2, Powerup.APPLY_SELF],
                [1, Powerup.APPLY_ALL]
            ]
        },
        {
            title : 'Apple spawns',
            action: Powerup.ACTION_APPLE_SPAWNS,
            odds  : [
                // Number of apples
                [7, 3],
                [2, 5],
                [1, 7]
            ]
        }
    ]

};
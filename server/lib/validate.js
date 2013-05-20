/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

/**
 * Validate / Sanitize user input.
 * Example usage: new Validate(str).assertType('string').valid(); // true|false
 * @param {*} value
 * @constructor
 */
function Validate(value) {
    this._value = value;
    this._valid = true;
}

module.exports = Validate;

Validate.prototype = {

    /**
     * @param {string} type
     * @return {Validate}
     */
    assertType: function(type) {
        if (typeof this._value !== type) {
            this._log('assertType', this._value, type);
            this._valid = false;
        }
        return this;
    },

    /**
     * @returns {Validate}
     */
    assertArray: function() {
        if (!(this._value instanceof Array)) {
            this._log('assertArray', this._value);
            this._valid = false;
        }
        return this;
    },

    /**
     * @returns {Validate}
     */
    assertJSON: function() {
        try {
            this._json = JSON.parse(this._value);
        } catch(err) {
            this._log('assertJSON', this._value);
            this._valid = false;
        }
        return this;
    },

    /**
     * @param {Array} arr
     * @return {Validate}
     */
    assertInArray: function(arr) {
        if (-1 === arr.indexOf(this._value)) {
            this._log('assertInArray', this._value, arr);
            this._valid = false;
        }
        return this;
    },

    /**
     * @param {number} min
     * @param {number} max
     * @return {Validate}
     */
    assertRange: function(min, max) {
        if (typeof this._value !== 'number') {
            this._log('assertRange type', this._value);
            this._valid = false;
        } else if (this._value < min || this._value > max) {
            this._log('assertRange range', this._value, min, max);
            this._valid = false;
        }
        return this;
    },

    /**
     * @param {number} min
     * @param {number} max
     * @return {Validate}
     */
    assertStringOfLength: function(min, max) {
        if (typeof this._value !== 'string') {
            this._log('assertStringOfLength type', this._value);
            this._valid = false;
        } else if (!this._assertLength(min, max)) {
            this._log('assertStringOfLength length', this._value, min, max);
            this._valid = false;
        }
        return this;
    },

    /**
     * @param {number} min
     * @param {number} max
     * @return {Validate}
     */
    assertArrayOfLength: function(min, max) {
        if (!(this._value instanceof Array)) {
            this._log('assertArrayOfLength type', this._value);
            this._valid = false;
        } else if (!this._assertLength(min, max)) {
            this._log('assertArrayOfLength length', this._value, min, max);
            this._valid = false;
        }
        return this;
    },

    /**
     * @param {number} min
     * @param {number} max
     * @return {boolean}
     */
    _assertLength: function(min, max) {
        return this._value.length >= min && this._value.length <= max;
    },

    /**
     * @return {boolean}
     */
    valid: function() {
        return this._valid;
    },

    /**
     * @param {*=} def
     * @return {*}
     */
    value: function(def) {
        return (this._valid) ? this._value : def;
    },

    /**
     * @param {*=} def
     * @return {*}
     */
    json: function(def) {
        return (this._valid) ? this._json : def;
    },

    /**
     * @param {string} message
     * @param {*} value
     * @param {...*} varArgs
     * @private
     */
    _log: function(message, value, varArgs) {
        var args = Array.prototype.slice.call(arguments, 2);
        console.log('Validation Error', message, JSON.stringify(value), args);
    }
    
};
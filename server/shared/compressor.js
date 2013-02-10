/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

/**
 * Compress and decompress large arrays containing numbers up to 92*92.
 * Applies preprocessing for sequential numbers, and a base 92 encode.
 * Compression is somewhere around 25% - 75%.
 * @constructor
 */
function Compressor() {
    this.map = this._generateCharMap();
}

module.exports = Compressor;

Compressor.prototype = {

    /**
     * @param {Array.<number>} arr
     * @return {string}
     */
    compress: function(arr) {
        var divisions = [], moduli = '', map, base;

        map = this.map;
        base = map.length; // 92

        for (var i = 0, m = arr.length; i < m; i++) {
            var num = arr[i];
            divisions.push(Math.floor(num / base));
            moduli += map.charAt(num % base);
        }

        divisions = this._compressAndDeflateDivisions(divisions);
        return divisions + '/' + moduli;
    },

    /**
     * @param {string} str
     * @return {Array.<number>}
     */
    decompress: function(str) {
        var split, map, base, divisions, moduli, decompressed = [];

        split = str.split('/');
        map = this.map;
        base = map.length;

        divisions = this._decompressDivisions(split[0]);
        divisions = this._inflateCompressions(divisions);

        moduli = split[1];

        for (var i = 0, m = moduli.length; i < m; i++) {
            decompressed.push(
                divisions[i] * base + map.indexOf(moduli.charAt(i))
            );
        }

        return decompressed;
    },

    /**
     * @param {Array.<number>} arr
     * @return {string}
     * @private
     */
    _compressAndDeflateDivisions: function(arr) {
        var map = this.map;
        var compressed = '', start = arr[0], len = 0;
        for (var i = 1, m = arr.length; i <= m; i++) {
            if (arr[i] - arr[i - 1] === 0) {
                len++;
            } else {
                compressed += map.charAt(start) + map.charAt(len);
                start = arr[i];
                len = 0;
            }
        }
        return compressed;
    },

    /**
     * @param {string} str
     * @return {Array}
     * @private
     */
    _decompressDivisions: function(str) {
        var arr = [], map = this.map;
        for (var i = 0, m = str.length; i < m; i += 2) {
            arr.push([
                map.indexOf(str.charAt(i)),
                map.indexOf(str.charAt(i + 1))
            ]);
        }
        return arr;
    },

    /**
     * @param {Array.<Array>} arr
     * @return {Array}
     * @private
     */
    _inflateCompressions: function(arr) {
        var decompressed = [];
        for (var i = 0, m = arr.length; i < m; i++) {
            for (var ii = 0; ii <= arr[i][1]; ii++) {
                decompressed.push(arr[i][0]);
            }
        }
        return decompressed;
    },

    /**
     * @return {string}
     * @private
     */
    _generateCharMap: function() {
        var map = '';
        for (var i = 32; i <= 126; i++) {
            switch (i) {
                // Skip characters that need escaping
                case 34: // Double Quote
                case 36: // Dollar Sign (special meaning in String.replace)
                case 39: // Single Quote
                case 47: // Reserve slash for separating divisions and moduli
                case 92: // Backslash
                    break;
                default:
                    map += String.fromCharCode(i);
            }
        }
        return map;
    }

};
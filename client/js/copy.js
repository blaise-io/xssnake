'use strict';

xss.copy = {
    /**
     * @param {number} num
     * @param {string=} singular
     * @param {string=} plural
     * @return {string}
     */
    pluralize: function(num, singular, plural) {
        return (num === 1) ? singular || '' : plural || 's';
    },

    /**
     * @param {string} base
     * @param {...string|number} varArgs
     * @return {string}
     */
    format: function(base, varArgs) {
        var args = Array.prototype.slice.call(arguments, 1);
        return base.replace(/\{(\d+)\}/g, function(match, index) {
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }
};

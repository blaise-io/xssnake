/*globals Shape*/
'use strict';

/**
 * @interface
 */
function StageInterface() {}

StageInterface.prototype = {

    /** @return {Shape} */
    getShape: function() {
        return new Shape();
    },

    /** @returns {Object} */
    getData: function() {
        return {};
    },

    /** @return */
    construct: function() {},

    /** @return */
    destruct: function() {}

};

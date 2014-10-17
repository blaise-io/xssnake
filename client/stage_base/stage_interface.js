'use strict';

/**
 * @interface
 */
xss.StageInterface = function() {
};

xss.StageInterface.prototype = {

    /** @return {xss.Shape} */
    getShape: function() {
        return new xss.Shape();
    },

    /** @return {Object} */
    getData: function() {
        return {};
    },

    /** @return */
    construct: function() {},

    /** @return */
    destruct: function() {}

};

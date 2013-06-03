/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
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

    /** @return */
    construct: function() {},

    /** @return */
    destruct: function() {}

};

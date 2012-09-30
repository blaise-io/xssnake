/*jshint globalstrict:true*/
/*globals Utils*/
'use strict';

(function SharedObject() {

    var extend = function(destination, source) {
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                destination[k] = source[k];
            }
        }
        return destination;
    };

    if (typeof Utils !== 'undefined') {
        Utils.extend = extend;
    } else {
        module.exports = {extend: extend};
    }

})();
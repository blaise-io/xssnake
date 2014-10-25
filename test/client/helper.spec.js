'use strict';

// PhantomJS 1.9.7 not supporting Function.prototype.bind...
// https://github.com/ariya/phantomjs/issues/10522
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill
if (!Function.prototype.bind) {
    Function.prototype.bind = function(scope) {
        if (typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var args = Array.prototype.slice.call(arguments, 1), fn = this, Fn = function() {
            }, fBound = function() {
                if (this instanceof Fn && scope) {
                    return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
                } else {
                    return fn.apply(scope, args.concat(Array.prototype.slice.call(arguments)));
                }
            };

        Fn.prototype = this.prototype;
        fBound.prototype = new Fn();
        return fBound;
    };
}

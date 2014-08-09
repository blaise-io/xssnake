'use strict';

xss.bootstrap.registerErrorHandler = function() {
    window.onerror = function() {
        xss.error = arguments;
    };
};

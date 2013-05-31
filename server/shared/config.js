/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals CONST:true*/
'use strict';

module.exports = {
    SERVER_PORT    : 8080,
    SERVER_ENDPOINT: 'http://localhost:8080/xssnake'
};

if (typeof XSS !== 'undefined') {
    CONST.SERVER_ENDPOINT = module.exports.SERVER_ENDPOINT;
}

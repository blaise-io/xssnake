'use strict';

var png = require('pngparse');

/**
 * Level image loader for Server
 * @param data
 * @param callback
 */
xss.levelImageLoader = function(data, callback) {
    var buffer = new Buffer(data, 'base64');
    png.parse(buffer, function(err, data) {
        callback(data);
    });
};

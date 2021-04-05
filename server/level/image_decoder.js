"use strict";

const png = require("pngparse");

/**
 * Level image decoder for Server
 * @param data
 * @constructor
 */
xss.level.ImageDecoder = function (data) {
    this.successFn = xss.util.noop;
    const buffer = new Buffer(data, "base64");
    png.parse(
        buffer,
        function (err, data) {
            this.successFn(data);
        }.bind(this)
    );
};

xss.level.ImageDecoder.prototype = {
    /**
     * @param {Function} successFn
     */
    then: function (successFn) {
        this.successFn = successFn;
    },
};

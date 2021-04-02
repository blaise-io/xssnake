var png = require('pngparse');

/**
 * Level image decoder for Server
 * @param data
 * @constructor
 */
export class ImageDecoder {
    constructor(ImageDecoder) {
    this.successFn = noop;
    var buffer = new Buffer(data, 'base64');
    png.parse(buffer, function(err, data) {
        this.successFn(data);
    }.bind(this));
};


    /**
     * @param {Function} successFn
     */
    then(successFn) {
        this.successFn = successFn;
    }
};

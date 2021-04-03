const png = require("pngparse");

/**
 * Level image decoder for Server
 * @param data
 * @constructor
 */
export class ImageDecoder {
    constructor(ImageDecoder) {
        this.successFn = () => {};
        const buffer = new Buffer(data, "base64");
        png.parse(buffer, function(err, data) {
            this.successFn(data);
        }.bind(this));
    }


    /**
     * @param {Function} successFn
     */
    then(successFn) {
        this.successFn = successFn;
    }
}

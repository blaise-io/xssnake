import png from "pngparse";

export class ImageDecoder {
    private successFn: CallableFunction;

    constructor(data: string) {
        this.successFn = () => {};
        const buffer = new Buffer(data, "base64");
        png.parse(buffer, function(err, data) {
            this.successFn(data);
        }.bind(this));
    }

    then(successFn: CallableFunction): void {
        this.successFn = successFn;
    }
}

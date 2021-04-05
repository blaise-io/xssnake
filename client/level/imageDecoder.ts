/**
 * Level image decoder for Client
 * @param {string} data
 * @constructor
 */
export class ImageDecoder {
    private successFn: any;
    private image: HTMLImageElement;

    constructor(data) {
        this.successFn = () => {};

        this.image = new Image();
        this.image.src = "data:image/png;base64," + data;
        this.image.onload = this.readFromCanvas.bind(this);
    }

    readFromCanvas() {
        let canvas;
        let ctx;
        let imagedata;

        canvas = document.createElement("canvas");
        canvas.width = this.image.width;
        canvas.height = this.image.height;

        ctx = canvas.getContext("2d");
        ctx.drawImage(this.image, 0, 0);

        imagedata = ctx.getImageData(0, 0, this.image.width, this.image.height);

        this.successFn(imagedata);
    }

    /**
     * @param {Function} successFn
     */
    then(successFn): void {
        // TODO: uses async
        this.successFn = successFn;
    }
}

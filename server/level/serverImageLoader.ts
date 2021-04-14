import png from "pngparse";

export async function serverImageLoader(base64Image: string): Promise<ImageData> {
    return new Promise((resolve) => {
        const base64ImageWithoutHeader = base64Image.replace(/^data:image\/png;base64,/, "");
        const buffer = new Buffer(base64ImageWithoutHeader, "base64");
        png.parse(
            buffer,
            function (err, data) {
                resolve(data);
            }.bind(this)
        );
    });
}

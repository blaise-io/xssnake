import { PNG } from "pngjs";

export async function serverImageLoader(base64Image: string): Promise<ImageData> {
    return new Promise((resolve) => {
        const base64ImageWithoutHeader = base64Image.replace(/^data:image\/png;base64,/, "");
        new PNG({ filterType: 4 }).parse(
            Buffer.from(base64ImageWithoutHeader, "base64"),
            (error: Error, png: PNG) => {
                resolve((png as unknown) as ImageData); // Yeah... close enough.
            },
        );
    });
}

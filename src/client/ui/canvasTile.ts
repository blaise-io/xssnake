import { CANVAS } from "../../shared/const";
import { ColorScheme, PixelStyle } from "./colorScheme";

export class CanvasTile {
    size: number;
    on: CanvasPattern;
    off: CanvasPattern;

    constructor(public colorScheme: ColorScheme) {
        delete this.on;
        delete this.off;
        this.size = 0;
    }

    setColorScheme(colorScheme: ColorScheme): void {
        this.colorScheme = colorScheme;
        this.updatePatterns();
    }

    updateSize(): number {
        const minWhitespace = 10;
        const minWidth =
            ((window.innerWidth - minWhitespace) * window.devicePixelRatio) / CANVAS.WIDTH;
        const minHeight =
            ((window.innerHeight - minWhitespace) * window.devicePixelRatio) / CANVAS.HEIGHT;
        this.size = Math.floor(Math.min(minWidth, minHeight)) || 1;
        this.updatePatterns();
        return this.size;
    }

    updatePatterns(): void {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("width", String(this.size));
        canvas.setAttribute("height", String(this.size));

        this.on = this._getTileForColor(canvas, this.colorScheme.on);
        this.off = this._getTileForColor(canvas, this.colorScheme.off);

        document.body.style.backgroundImage = "url(" + canvas.toDataURL("image/png") + ")";
        document.body.style.backgroundColor = this.colorScheme.bg;
        document.body.style.backgroundSize = this.size / 2 + "px";
    }

    private _getTileForColor(canvas: HTMLCanvasElement, color: string): CanvasPattern {
        const context = canvas.getContext("2d");

        const pixelSize = this.size === 1 ? 1 : this.size - this.colorScheme.gap;

        context.fillStyle = this.colorScheme.bg;
        context.fillRect(0, 0, this.size, this.size);
        context.fillStyle = color;

        if (this.colorScheme.style == PixelStyle.rectangular) {
            context.fillRect(0, 0, pixelSize, pixelSize);
        } else {
            context.arc(pixelSize / 2, pixelSize / 2, pixelSize / 2, 0, 2 * Math.PI, false);
            context.fill();
        }

        return context.createPattern(canvas, "repeat");
    }
}

/**
 * @param {ColorScheme} colorScheme
 * @constructor
 */
import { HEIGHT, WIDTH } from "../../shared/const";
import { ColorScheme } from "./colorScheme";

export class CanvasTile {
    size: number;
    on: string;
    off: string;

    constructor(public colorScheme: ColorScheme) {
        this.on = null;
        this.off = null;
        this.size = 0;
    }

    /**
     * @param {ColorScheme} colorScheme
     */
    setColorScheme(colorScheme) {
        this.colorScheme = colorScheme;
        this.updatePatterns();
    }

    /**
     * @return {number}
     */
    updateSize() {
        let minWidth; let minHeight;
        minWidth = window.innerWidth / WIDTH;
        minHeight = window.innerHeight / HEIGHT;
        this.size = Math.floor(Math.min(minWidth, minHeight)) || 1;
        this.updatePatterns();
        return this.size;
    }

    updatePatterns() {
        let canvas; let backgroundImage;

        canvas = document.createElement("canvas");
        canvas.setAttribute("width", String(this.size));
        canvas.setAttribute("height", String(this.size));

        this.on = this._getTileForColor(canvas, this.colorScheme.on);
        this.off = this._getTileForColor(canvas, this.colorScheme.off);

        backgroundImage = " url(" + canvas.toDataURL("image/png") + ")";
        document.body.style.background = this.colorScheme.bg + backgroundImage;
    }

    _getTileForColor(canvas, color) {
        let context; let pixelSize;

        context = canvas.getContext("2d");
        // Prevent completely transparent borders for visibility.
        pixelSize = this.size === 1 ? 1 : this.size - 0.35;

        context.fillStyle = this.colorScheme.bg;
        context.fillRect(0, 0, this.size, this.size);
        context.fillStyle = color;
        context.fillRect(0, 0, pixelSize, pixelSize);

        return context.createPattern(canvas, "repeat");
    }
}

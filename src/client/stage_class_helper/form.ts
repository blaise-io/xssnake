import { HEIGHT } from "../../shared/const";
import { PixelCollection } from "../../shared/pixelCollection";
import { Shape } from "../../shared/shape";
import { ensureIndexWithinBounds } from "../../shared/util";
import { MENU_LEFT, MENU_TITLE_HEIGHT, MENU_TOP, MENU_WIDTH, UC_TR_LEFT } from "../const";
import { font, fontHeight, fontPixels, fontWidth, LINE_HEIGHT, LINE_HEIGHT_MENU } from "../ui/font";
import { zoom } from "../ui/transformClient";

export class Form {
    private selectedField: number;
    private selectedOption: number[];
    private fields: { id: number; label: string; options: [any, any][] }[];
    private maxwidth: number;

    constructor(public header: string, public footer: string = "") {
        this.header = header.toUpperCase();

        this.selectedField = 0;
        this.selectedOption = [];
        this.fields = [];
        this.maxwidth = 0;
    }

    addField(id: number, label: string, options: [any, any][]): void {
        this.fields.push({
            id: id,
            label: label.toUpperCase(),
            options: options,
        });

        this.selectedOption.push(0);

        for (let i = 0, m = options.length; i < m; i++) {
            this.maxwidth = Math.max(this.maxwidth, fontWidth(options[i][1].toUpperCase()));
        }
    }

    selectField(delta: number): void {
        this.selectedField = ensureIndexWithinBounds(this.selectedField + delta, this.fields);
    }

    selectOption(delta: number): void {
        const focusField = this.fields[this.selectedField];
        if (focusField) {
            this.selectedOption[this.selectedField] = ensureIndexWithinBounds(
                this.selectedOption[this.selectedField] + delta,
                focusField.options
            );
        }
    }

    getShape(): Shape {
        const x = MENU_LEFT;
        let y = MENU_TOP;

        const optionX = MENU_LEFT + 2 + MENU_WIDTH - this.maxwidth - fontWidth(" " + UC_TR_LEFT);

        const shape = new Shape();
        shape.add(this._getHeaderPixels(x, y));
        shape.add(this._getFooterPixels(x));

        y += MENU_TITLE_HEIGHT;

        // Draw options
        for (let i = 0, m = this.fields.length; i < m; i++) {
            const active = this.selectedField === i;
            const option = this._getOptionsShape(i, x, optionX, y);

            if (active) {
                const bbox = option.bbox();
                bbox.x0 -= 1;
                bbox.x1 += 1;
                bbox.y0 = y - 1;
                bbox.y1 = y + LINE_HEIGHT;
                option.invert();
            }

            shape.add(option.pixels);
            y += LINE_HEIGHT_MENU;
        }

        return shape;
    }

    getData(): unknown[] {
        const values = [];
        for (let i = 0, m = this.fields.length; i < m; i++) {
            const field = this.fields[i];
            const optionIndex = this.selectedOption[i];
            values[field.id] = field.options[optionIndex][0];
        }
        return values;
    }

    _getHeaderPixels(x: number, y: number): PixelCollection {
        const header = fontPixels(this.header);
        return zoom(2, header, x, y);
    }

    _getFooterPixels(x: number): PixelCollection {
        const height = fontHeight(this.footer);
        return fontPixels(this.footer, x, HEIGHT - 3 - height);
    }
    _getOptionsShape(i: number, x: number, col2X: number, y: number): Shape {
        const props: { left?: number; right?: number; option?: number } = {};

        const label = this.fields[i].label;
        const shape = font(label, x, y);

        const option = this.fields[i].options[this.selectedOption[i] || 0];
        const value = option[1].toUpperCase();

        props.option = col2X + (this.maxwidth - fontWidth(value)) / 2;
        props.option = Math.floor(props.option);

        const pixels = fontPixels(value, props.option, y);
        shape.add(pixels);

        props.left = col2X - fontWidth(UC_TR_LEFT + " ");
        props.right = col2X + this.maxwidth + fontWidth(" ");

        shape.add(fontPixels("<", props.left, y), fontPixels(">", props.right, y));

        return shape;
    }
}

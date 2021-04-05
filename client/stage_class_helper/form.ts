import { HEIGHT } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { ensureIndexWithinBounds } from "../../shared/util";
import { MENU_LEFT, MENU_TITLE_HEIGHT, MENU_TOP, MENU_WIDTH, UC_TR_LEFT } from "../const";
import { font, fontHeight, fontPixels, fontWidth, LINE_HEIGHT, LINE_HEIGHT_MENU } from "../ui/font";
import { zoom } from "../ui/transformClient";

export class Form {
    private selectedField: number;
    private selectedOption: any[];
    private fields: any[];
    private maxwidth: number;

    constructor(public header: string, public footer: string = "") {
        this.header = header.toUpperCase();

        this.selectedField = 0;
        this.selectedOption = [];
        this.fields = [];
        this.maxwidth = 0;
    }

    /**
     * @param {number} id
     * @param {string} label
     * @param {Array.<Array>=} options
     */
    addField(id, label, options) {
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

    /**
     * @param {number} delta
     */
    selectField(delta) {
        this.selectedField = ensureIndexWithinBounds(this.selectedField + delta, this.fields);
    }

    /**
     * @param {number} delta
     */
    selectOption(delta) {
        const focusField = this.fields[this.selectedField];
        if (focusField) {
            this.selectedOption[this.selectedField] = ensureIndexWithinBounds(
                this.selectedOption[this.selectedField] + delta,
                focusField.options
            );
        }
    }

    /**
     * @return {Shape}
     */
    getShape() {
        let x;
        let optionX;
        let y;
        let shape;

        x = MENU_LEFT;
        y = MENU_TOP;

        optionX = MENU_LEFT + 2 + MENU_WIDTH - this.maxwidth - fontWidth(" " + UC_TR_LEFT);

        shape = new Shape();
        shape.add(this._getHeaderPixels(x, y));
        shape.add(this._getFooterPixels(x));

        y += MENU_TITLE_HEIGHT;

        // Draw options
        for (let i = 0, m = this.fields.length; i < m; i++) {
            var option;
            var bbox;
            const active = this.selectedField === i;

            option = this._getOptionsShape(i, x, optionX, y, active);

            if (active) {
                bbox = option.bbox();
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

    getData() {
        const values = [];
        for (let i = 0, m = this.fields.length; i < m; i++) {
            const field = this.fields[i];
            const optionIndex = this.selectedOption[i];
            values[field.id] = field.options[optionIndex][0];
        }
        return values;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {PixelCollection}
     * @private
     */
    _getHeaderPixels(x, y) {
        const header = fontPixels(this.header);
        return zoom(2, header, x, y);
    }

    /**
     * @param {number} x
     * @return {PixelCollection}
     * @private
     */
    _getFooterPixels(x) {
        const height = fontHeight(this.footer);
        return fontPixels(this.footer, x, HEIGHT - 3 - height);
    }

    /**
     * @param {number} i
     * @param {number} x
     * @param {number} col2X
     * @param {number} y
     * @param {boolean} active
     * @return {Shape}
     * @private
     */
    _getOptionsShape(i, x, col2X, y, active) {
        let label;
        let shape;
        let value;
        let option;
        let pixels;
        const props: any = {};

        label = this.fields[i].label;
        shape = font(label, x, y);

        option = this.fields[i].options[this.selectedOption[i] || 0];
        value = option[1].toUpperCase();

        props.option = col2X + (this.maxwidth - fontWidth(value)) / 2;
        props.option = Math.floor(props.option);

        pixels = fontPixels(value, props.option, y);
        shape.add(pixels);

        props.left = col2X - fontWidth(UC_TR_LEFT + " ");
        props.right = col2X + this.maxwidth + fontWidth(" ");

        shape.add(fontPixels("<", props.left, y), fontPixels(">", props.right, y));

        return shape;
    }
}

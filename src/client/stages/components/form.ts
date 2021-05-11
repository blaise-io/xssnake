import { CANVAS } from "../../../shared/const";
import { PixelCollection } from "../../../shared/pixelCollection";
import { Shape } from "../../../shared/shape";
import { _, indexCarousel } from "../../../shared/util";
import { KEY, MENU_POS, UC } from "../../const";
import { State } from "../../state";
import {
    font,
    fontHeight,
    fontPixels,
    fontWidth,
    LINE_HEIGHT,
    LINE_HEIGHT_MENU,
} from "../../ui/font";
import { zoom } from "../../ui/transformClient";
import { stylizeUpper } from "../../util/clientUtil";

type FieldOptionValue = boolean | number;

const FORM_FOOTER_COPY = [
    _(`${UC.ARR_UP} & ${UC.ARR_DOWN} to select an option`),
    _(`${UC.ARR_LEFT} & ${UC.ARR_RIGHT} to change the value`),
    _(`${UC.ENTER_KEY} to continue`),
].join(" …\n");

export class Field {
    constructor(
        public label: string,
        public options: [FieldOptionValue, string][],
        public value: FieldOptionValue,
        public onupdate: (value: FieldOptionValue) => void,
    ) {
        this.label = stylizeUpper(label);
    }

    get selectedOption(): [FieldOptionValue, string] {
        return this.options.find((option) => option[0] === this.value) || this.options[0];
    }

    getShape(x: number, col2X: number, y: number, maxwidth: number): Shape {
        const props: { left?: number; right?: number; option?: number } = {};
        const shape = font(this.label, x, y);
        const value = stylizeUpper(this.selectedOption[1]);

        props.option = col2X + (maxwidth - fontWidth(value)) / 2;
        props.option = Math.floor(props.option);

        shape.add(fontPixels(value, props.option, y));

        props.left = col2X - fontWidth(UC.TR_LEFT + " ");
        props.right = col2X + maxwidth + fontWidth(" ");

        shape.add(fontPixels("<", props.left, y), fontPixels(">", props.right, y));

        return shape;
    }
}

export class Form {
    private focusFieldIndex = 0;

    private fields: Field[] = [];

    private maxwidth = 0;

    constructor(public header: string, public footer = FORM_FOOTER_COPY) {
        this.header = stylizeUpper(header);
    }

    handleKeys(event: KeyboardEvent): boolean {
        switch (event.key) {
            case KEY.UP:
                this.switchField(-1);
                State.audio.play("menu");
                return true;
            case KEY.DOWN:
                this.switchField(1);
                State.audio.play("menu");
                return true;
            case KEY.LEFT:
                this.selectOption(-1);
                State.audio.play("menu_alt");
                return true;
            case KEY.RIGHT:
                this.selectOption(1);
                State.audio.play("menu_alt");
                return true;
        }
        return false;
    }

    addField(field: Field): void {
        this.fields.push(field);

        // TODO: getter / es6 arr fn
        for (let i = 0, m = field.options.length; i < m; i++) {
            this.maxwidth = Math.max(this.maxwidth, fontWidth(stylizeUpper(field.options[i][1])));
        }
    }

    switchField(delta: number): void {
        this.focusFieldIndex = indexCarousel(this.focusFieldIndex + delta, this.fields.length);
    }

    selectOption(delta: number): void {
        const field = this.fields[this.focusFieldIndex];
        const index = field.options.indexOf(field.selectedOption);
        const newOptionIndex = indexCarousel(index + delta, field.options.length);
        field.value = field.options[newOptionIndex][0];
        field.onupdate(field.value);
    }

    getShape(): Shape {
        let y = MENU_POS.TOP;

        const optionX =
            MENU_POS.LEFT + 2 + MENU_POS.WIDTH - this.maxwidth - fontWidth(" " + UC.TR_LEFT);

        const shape = new Shape();
        shape.add(this.getHeaderPixels(MENU_POS.LEFT, y));
        shape.add(this.getFooterPixels(MENU_POS.LEFT));

        y += MENU_POS.TITLE_HEIGHT;

        // Draw options
        for (let i = 0, m = this.fields.length; i < m; i++) {
            const active = this.focusFieldIndex === i;
            const option = this.fields[i].getShape(MENU_POS.LEFT, optionX, y, this.maxwidth);

            if (active) {
                const bbox = option.bbox();
                bbox.x0 = MENU_POS.LEFT - 2;
                bbox.x1 = MENU_POS.LEFT + MENU_POS.WIDTH + 3;
                bbox.y0 = y - 1;
                bbox.y1 = y + LINE_HEIGHT;
                option.invert(bbox);
            }

            shape.add(option.pixels);
            y += LINE_HEIGHT_MENU;
        }

        return shape;
    }

    private getHeaderPixels(x: number, y: number): PixelCollection {
        const header = fontPixels(this.header);
        return zoom(2, header, x, y);
    }

    private getFooterPixels(x: number): PixelCollection {
        const height = fontHeight(this.footer);
        return fontPixels(this.footer, x, CANVAS.HEIGHT - 3 - height);
    }
}

import { CANVAS } from "../../../shared/const";
import { Shape } from "../../../shared/shape";
import { lineShape } from "../../../shared/shapeGenerator";
import { noop } from "../../../shared/util";
import { FRAME } from "../../const";
import { EventHandler } from "../../util/eventHandler";
import { State } from "../../state";
import { fontEndPos, FontOptions, fontPixels, fontWidth } from "../../ui/font";
import { flash } from "../../ui/shapeClient";

export class InputField {
    maxValWidth?: number;
    displayWidth = CANVAS.WIDTH - this.x - 8;
    callback: CallableFunction = noop;
    private input: HTMLInputElement;
    private eventHandler = new EventHandler();
    private maxlength = 156;

    constructor(
        public x: number,
        public y: number,
        public prefix: string,
        public fontOptions?: FontOptions,
    ) {
        State.keysBlocked = true;
        this.input = this.addInputToDom();
        this.input.focus();
    }

    destruct(): void {
        if (this.input && this.input.parentNode) {
            this.input.parentNode.removeChild(this.input);
        }
        this.eventHandler.destruct();
        delete State.shapes.INPUT_CARET;
        delete State.shapes.INPUT_VALUE;
        State.keysBlocked = false;
    }

    bindEvents(): void {
        this.eventHandler.on("keypress", () => {
            State.audio.play("menu_alt");
        });
        this.eventHandler.on("keydown", this.updateShapes.bind(this));
        this.eventHandler.on("keyup", this.updateShapes.bind(this));
    }

    setValue(value: string): void {
        this.input.focus();
        this.input.value = value;
        this.input.setSelectionRange(value.length, value.length);
        this.bindEvents();
        this.updateShapes();
    }

    get value(): string {
        return this.input.value;
    }

    private updateShapes(): void {
        this.maxwidthCutOff();
        this.callback(this.input.value);
        State.shapes.INPUT_CARET = this.getCaretShape();
        State.shapes.INPUT_VALUE = this.getInputValueShape();
    }

    private addInputToDom(): HTMLInputElement {
        const input = document.createElement("input");
        input.setAttribute("maxlength", String(this.maxlength));
        input.focus();
        document.body.appendChild(input);
        return input;
    }

    private getCaretShape(): Shape {
        const segments = this.getSelectionSegments();
        const untilCaretStr = segments[0] + segments[1];
        const endPos = fontEndPos(this.prefix + untilCaretStr, this.x, this.y, this.fontOptions);
        const caret = [endPos[0] - 1, endPos[1]];

        const caretShape = lineShape(caret[0], caret[1] - 1, caret[0], caret[1] + 7);

        flash(caretShape, FRAME * 20, FRAME * 20);

        return caretShape;
    }

    private getInputValueShape(): Shape {
        const values = this.getSelectionSegments();
        const shape = new Shape();
        let endpos;
        shape.add(fontPixels(this.prefix + values[0], this.x, this.y, this.fontOptions));

        if (values[1]) {
            // Selection
            endpos = fontEndPos(this.prefix + values[0], this.x, this.y, this.fontOptions);
            shape.add(fontPixels(values[1], endpos[0], endpos[1], { invert: true }));
        }

        endpos = fontEndPos(this.prefix + values[0] + values[1], this.x, this.y, this.fontOptions);
        shape.add(fontPixels(values[2], endpos[0], endpos[1]));

        return shape;
    }

    private getSelectionSegments(): string[] {
        const input = this.input;
        let value = input.value;
        let start = input.selectionStart as number;
        let end = input.selectionEnd as number;
        // Handle situation where input value is wider than display width.
        while (fontWidth(value) > this.displayWidth) {
            if (start === 0) {
                value = value.substring(0, value.length - 2);
            } else {
                value = value.substring(1, value.length);
                start--;
                end--;
            }
        }

        return [value.substring(0, start), value.substring(start, end), value.substring(end)];
    }

    private maxwidthCutOff(): void {
        if (this.maxValWidth) {
            while (fontWidth(this.input.value) > (this.maxValWidth as number)) {
                this.input.value = this.input.value.slice(0, -1);
            }
        }
    }
}

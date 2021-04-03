/**
 * @param {number} x
 * @param {number} y
 * @param {string=} prefix
 * @param {Object=} fontOptions
 * @constructor
 */
import { WIDTH } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { lineShape } from "../../shared/shapeGenerator";
import { DOM_EVENT_KEYDOWN, DOM_EVENT_KEYPRESS, DOM_EVENT_KEYUP, FRAME, NS_INPUT } from "../const";
import { State } from "../state/state";
import { fontEndPos, fontPixels, fontWidth } from "../ui/font";

export class InputField {
    maxValWidth: number;
    displayWidth: number;
    maxlength: number;
    callback: any;
    private input: HTMLInputElement;

    constructor(public x: number, public y: number, public prefix: string, public fontOptions?: any) {
        this.callback = () => {};
        this.maxValWidth = null;
        this.displayWidth = WIDTH - x - 8;
        this.maxlength = 156;

        this.input = this.addInputToDom();
        this.input.focus();

        State.keysBlocked = true;
    }

    destruct() {
        if (this.input && this.input.parentNode) {
            this.input.parentNode.removeChild(this.input);
        }
        this.unbindEvents();
        State.shapes.INPUT_CARET = null;
        State.shapes.INPUT_VALUE = null;
        State.keysBlocked = false;
    }

    unbindEvents() {
        State.events.off(DOM_EVENT_KEYPRESS, NS_INPUT);
        State.events.off(DOM_EVENT_KEYDOWN, NS_INPUT);
        State.events.off(DOM_EVENT_KEYUP, NS_INPUT);
    }

    bindEvents() {
        State.events.on(DOM_EVENT_KEYPRESS, NS_INPUT, function() {
            State.audio.play('menu_alt');
        });
        State.events.on(DOM_EVENT_KEYDOWN, NS_INPUT, this.updateShapes.bind(this));
        State.events.on(DOM_EVENT_KEYUP, NS_INPUT, this.updateShapes.bind(this));
    }

    /**
     * @param {string} value
     */
    setValue(value) {
        this.input.focus();
        this.input.value = value;
        this.input.setSelectionRange(value.length, value.length);
        this.bindEvents();
        this.updateShapes();
    }

    /**
     * @return {string}
     */
    getValue() {
        return this.input.value;
    }

    updateShapes() {
        this.maxwidthCutOff();
        this.callback(this.input.getAttribute("value"));
        State.shapes.INPUT_CARET = this.getCaretShape();
        State.shapes.INPUT_VALUE = this.getInputValueShape();
    }

    /**
     * @return {Element}
     */
    addInputToDom() {
        const input = document.createElement('input');
        input.setAttribute('maxlength', String(this.maxlength));
        input.focus();
        document.body.appendChild(input);
        return input;
    }

    /**
     * @return {Shape}
     */
    getCaretShape() {
        let segments; let untilCaretStr; let caret; let caretShape;

        segments = this.getSelectionSegments();
        untilCaretStr = segments[0] + segments[1];
        const endPos = fontEndPos(this.prefix + untilCaretStr, this.x, this.y, this.fontOptions);
        caret = [endPos[0] - 1, endPos[1]];

        caretShape = lineShape(
            caret[0], caret[1] - 1,
            caret[0], caret[1] + 7
        );

        caretShape.flash(FRAME * 20, FRAME * 20);

        return caretShape;
    }

    /**
     * @return {Shape}
     */
    getInputValueShape() {
        let shape; let values; let endpos;

        values = this.getSelectionSegments();
        shape = new Shape();
        shape.add(fontPixels(
            this.prefix + values[0], this.x, this.y, this.fontOptions
        ));

        if (values[1]) { // Selection
            endpos = fontEndPos(
                this.prefix + values[0], this.x, this.y, this.fontOptions
            );
            shape.add(fontPixels(values[1], endpos[0], endpos[1], {invert: true}));
        }

        endpos = fontEndPos(
            this.prefix + values[0] + values[1], this.x, this.y, this.fontOptions
        );

        shape.add(
            fontPixels(values[2],
                endpos[0],
                endpos[1])
        );

        return shape;
    }

    /**
     * @return {Array.<string>}
     * @private
     */
    getSelectionSegments() {
        let input; let value; let start; let end;

        input = this.input;
        value = input.value;
        start = input.selectionStart;
        end = input.selectionEnd;

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

        return [
            value.substring(0, start),
            value.substring(start, end),
            value.substring(end)
        ];
    }

    maxwidthCutOff() {
        if (null !== this.maxValWidth) {
            while (fontWidth(this.input.value) > (this.maxValWidth as number)) {
                this.input.value = this.input.value.slice(0, -1);
            }
        }
    }

}

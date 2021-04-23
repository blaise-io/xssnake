import { Shape } from "../../../shared/shape";
import { KEY, MENU_LEFT, MENU_TOP, MENU_WIDTH, NS, STORAGE_NAME } from "../../const";
import { InputField } from "../components/inputField";
import { State } from "../../state";
import { font, fontHeight, fontPixels } from "../../ui/font";
import { lifetime } from "../../ui/shapeClient";
import { zoom } from "../../ui/transformClient";
import { storage } from "../../util/clientUtil";
import { StageInterface } from "./stage";

export class InputStage implements StageInterface {
    private _shape: Shape;
    private fontOptions = { wrap: MENU_LEFT + MENU_WIDTH - 25 };
    private _inputTop = MENU_TOP + 17;
    value: string;
    private input: InputField;

    constructor() {
        this.value = (storage(STORAGE_NAME) as string) || "";
        this._shape = this._getShape();
    }

    name = "";
    header = "";
    label = "";
    next: any = InputStage; // TODO: StageInterface

    minlength = 0;
    maxChars = 0;
    maxwidth = 0;
    displayWidth = 0;

    getShape(): Shape {
        return this._shape;
    }

    getData(): Record<string, string> {
        return {};
    }

    getValue(): string {
        return this.value;
    }

    construct(): void {
        this.input = this._setupInputField();
        this._shape = this._getShapeExcludeValue();
        console.log(this);
        this._bindEvents();
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        State.shapes.message = null;
        this._shape = this._getShape();
        this.input.destruct();
        if (this.name) {
            storage(this.name, this.value);
        }
    }

    inputSubmit(error: string, value: string, top: number): void {
        if (!error && value && top) {
            State.flow.switchStage(this.next);
            State.events.off("keydown", NS.INPUT);
        } else {
            State.shapes.message = font(error, MENU_LEFT, top);
            lifetime(State.shapes.message, 0, 500);
        }
    }

    private _setupInputField(): InputField {
        const input = new InputField(MENU_LEFT, this._inputTop, this.label, this.fontOptions);

        input.maxValWidth = this.maxwidth || input.maxValWidth;
        input.displayWidth = this.displayWidth || input.displayWidth;

        input.callback = function (value) {
            console.log(value, this, "UPD");
            this.value = value;
        }.bind(this);

        input.setValue(this.value);

        return input;
    }

    private _bindEvents(): void {
        console.log(this);
        State.events.on("keydown", NS.STAGES, this._handleKeys.bind(this));
    }

    /**
     * @private
     */
    _handleKeys(ev: KeyboardEvent): void {
        console.log(this);
        let value;
        let top;
        switch (ev.keyCode) {
            case KEY.ESCAPE:
                State.flow.previousStage();
                ev.preventDefault();
                break;
            case KEY.ENTER:
                value = this.value.trim();
                top = fontHeight(this.label, MENU_LEFT, this._inputTop, this.fontOptions);
                this.inputSubmit(this._getInputError(value), value, top);
        }
    }

    private _getInputError(val: string): string {
        if (val.length < this.minlength) {
            return "Too short!!";
        } else if (this.maxChars && val.length > this.maxChars) {
            return "Too long!!";
        }
        return "";
    }

    private _getShape(): Shape {
        const shape = this._getShapeExcludeValue();
        shape.add(this._getDataShape().pixels);
        return shape;
    }

    private _getShapeExcludeValue(): Shape {
        let pixels = fontPixels(this.header);
        pixels = zoom(2, pixels, MENU_LEFT, MENU_TOP);
        return new Shape(pixels);
    }

    private _getDataShape(): Shape {
        const value = this.label + this.value;
        return new Shape(fontPixels(value, MENU_LEFT, this._inputTop, this.fontOptions));
    }
}

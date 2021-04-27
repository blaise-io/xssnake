import { Shape } from "../../../shared/shape";
import { KEY, MENU_LEFT, MENU_TOP, MENU_WIDTH, NS } from "../../const";
import { InputField } from "../components/inputField";
import { State } from "../../state";
import { font, fontHeight, fontPixels } from "../../ui/font";
import { lifetime } from "../../ui/shapeClient";
import { zoom } from "../../ui/transformClient";
import { storage } from "../../util/clientUtil";
import { StageConstructor, StageInterface } from "./stage";

export abstract class InputStage implements StageInterface {
    shape: Shape;
    private fontOptions = { wrap: MENU_LEFT + MENU_WIDTH - 25 };
    private value: string;
    private input: InputField;
    private inputTop = MENU_TOP + 17;

    abstract name: string;
    abstract header: string;
    abstract label: string;
    abstract next: StageConstructor;

    initial = "";
    minlength = 0;
    maxChars = 0;
    maxwidth = 0;
    displayWidth = 0;

    getShape(): Shape {
        return this.shape;
    }

    getLabelAndValueShape(): Shape {
        const shape = this.getLabelShape();
        shape.add(this.getValueShape().pixels);
        return shape;
    }

    construct(): void {
        this.value = this.name ? (storage(this.name) as string) || this.initial : this.initial;
        this.input = this.setupInputField();
        this.shape = this.getLabelShape();
        this.bindEvents();
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        State.shapes.message = undefined;
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

    private setupInputField(): InputField {
        const input = new InputField(MENU_LEFT, this.inputTop, this.label, this.fontOptions);

        input.maxValWidth = this.maxwidth || input.maxValWidth;
        input.displayWidth = this.displayWidth || input.displayWidth;

        input.callback = function (value) {
            this.value = value;
        }.bind(this);

        input.setValue(this.value);

        return input;
    }

    private bindEvents(): void {
        State.events.on("keydown", NS.STAGES, this.handleKeys.bind(this));
    }

    private handleKeys(ev: KeyboardEvent): void {
        let value;
        let top;
        switch (ev.keyCode) {
            case KEY.ESCAPE:
                State.flow.previousStage();
                ev.preventDefault();
                break;
            case KEY.ENTER:
                value = this.value.trim();
                top = fontHeight(this.label, MENU_LEFT, this.inputTop, this.fontOptions);
                this.inputSubmit(this.getInputError(value), value, top);
        }
    }

    private getInputError(val: string): string {
        if (val.length < this.minlength) {
            return "Too short!!";
        } else if (this.maxChars && val.length > this.maxChars) {
            return "Too long!!";
        }
        return "";
    }

    private getLabelShape(): Shape {
        let pixels = fontPixels(this.header);
        pixels = zoom(2, pixels, MENU_LEFT, MENU_TOP);
        return new Shape(pixels);
    }

    private getValueShape(): Shape {
        const value = this.label + this.value;
        return new Shape(fontPixels(value, MENU_LEFT, this.inputTop, this.fontOptions));
    }
}

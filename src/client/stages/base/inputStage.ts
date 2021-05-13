import { Shape } from "../../../shared/shape";
import { KEY, MENU_POS, STORAGE } from "../../const";
import { EventHandler } from "../../netcode/eventHandler";
import { InputField } from "../components/inputField";
import { State } from "../../state";
import { font, fontHeight, fontPixels } from "../../ui/font";
import { lifetime } from "../../ui/shapeClient";
import { zoom } from "../../ui/transformClient";
import { storage } from "../../util/clientUtil";
import { StageConstructor, StageInterface } from "./stage";

export abstract class InputStage implements StageInterface {
    shape = new Shape();
    eventHandler = new EventHandler();
    private fontOptions = { wrap: MENU_POS.LEFT + MENU_POS.WIDTH - 25 };
    private value = "";
    private input?: InputField;
    private inputTop = MENU_POS.TOP + 17;

    abstract name: STORAGE | null;
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
        this.value = this.name ? (storage.get(this.name) as string) || this.initial : this.initial;
        this.input = this.setupInputField();
        this.shape = this.getLabelShape();
        this.bindEvents();
    }

    destruct(): void {
        this.eventHandler.destruct();
        delete State.shapes.message;
        this.input?.destruct();
        if (this.name) {
            storage.set(this.name, this.value);
        }
    }

    inputSubmit(error: string, value: string, top: number): void {
        if (!error && value && top) {
            this.eventHandler.destruct();
            State.flow.switchStage(this.next);
        } else {
            State.shapes.message = font(error, MENU_POS.LEFT, top);
            lifetime(State.shapes.message, 0, 500);
        }
    }

    private setupInputField(): InputField {
        const input = new InputField(MENU_POS.LEFT, this.inputTop, this.label, this.fontOptions);

        input.maxValWidth = this.maxwidth || input.maxValWidth;
        input.displayWidth = this.displayWidth || input.displayWidth;

        input.callback = (value: string) => {
            this.value = value;
        };

        input.setValue(this.value);

        return input;
    }

    private bindEvents(): void {
        this.eventHandler.on("keydown", this.handleKeys.bind(this));
    }

    private handleKeys(event: KeyboardEvent): void {
        if (event.key === KEY.ESCAPE) {
            State.flow.previousStage();
            event.preventDefault();
        } else if (event.key === KEY.ENTER) {
            const value = this.value.trim();
            const top = fontHeight(this.label, MENU_POS.LEFT, this.inputTop, this.fontOptions);
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
        pixels = zoom(2, pixels, MENU_POS.LEFT, MENU_POS.TOP);
        return new Shape(pixels);
    }

    private getValueShape(): Shape {
        const value = this.label + this.value;
        return new Shape(fontPixels(value, MENU_POS.LEFT, this.inputTop, this.fontOptions));
    }
}

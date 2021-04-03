/**
 * BaseInputStage
 * Stage with a form input
 * @implements {StageInterface}
 * @constructor
 */
import { Shape } from "../../shared/shape";
import {
    DOM_EVENT_KEYDOWN, KEY_ENTER, KEY_ESCAPE, MENU_LEFT, MENU_TOP, MENU_WIDTH, NS_INPUT, NS_STAGES,
    STORAGE_NAME
} from "../const";
import { InputField } from "../stage_class_helper/inputField";
import { State } from "../state/state";
import { font, fontHeight, fontPixels } from "../ui/font";
import { lifetime } from "../ui/shapeClient";
import { zoom } from "../ui/transformClient";
import { storage } from "../util/clientUtil";

export class InputStage {
    private _shape: Shape;
    private fontOptions: any;
    private _inputTop: number;
    public value: any;
    private input: any;

    constructor() {
        /** @type {string} */
        this.value = storage(STORAGE_NAME) || "";
        this._inputTop = MENU_TOP + 17;
        this.fontOptions = {wrap: MENU_LEFT + MENU_WIDTH - 25};
        this._shape = this._getShape();
    }

    name = ""
    header = ""
    label = ""
    next: any = InputStage // TODO: StageInterface

    minlength = 0
    maxChars = 0
    maxwidth = 0
    displayWidth = 0


    /**
     * @return {Shape}
     */
    getShape() {
        return this._shape;
    }

    /**
     * @return {Object}
     */
    getData() {
        return {};
    }

    /**
     * @return {string}
     */
    getValue() {
        return this.value;
    }

    construct() {
        this.input = this._setupInputField();
        this._shape = this._getShapeExcludeValue();
        console.log(this);
        this._bindEvents();
    }

    destruct() {
        State.events.off(DOM_EVENT_KEYDOWN, NS_STAGES);
        State.shapes.message = null;
        this._shape = this._getShape();
        this.input.destruct();
        if (this.name) {
            storage(this.name, this.value);
        }
    }

    /**
     * @param {string} error
     * @param {string} value
     * @param {number} top
     */
    inputSubmit(error, value, top) {
        if (!error && value && top) {
            State.flow.switchStage(this.next);
            State.events.off(DOM_EVENT_KEYDOWN, NS_INPUT);
        } else {
            State.shapes.message = font(error, MENU_LEFT, top);
            lifetime(State.shapes.message, 0, 500);
        }
    }

    _setupInputField() {
        const input = new InputField(
            MENU_LEFT, this._inputTop, this.label, this.fontOptions
        );

        input.maxValWidth = this.maxwidth || input.maxValWidth;
        input.displayWidth = this.displayWidth || input.displayWidth;

        input.callback = function(value) {
            console.log(value, this, "UPD");
            this.value = value;
        }.bind(this);

        input.setValue(this.value);

        return input;
    }

    /**
     * @private
     */
    _bindEvents() {
        console.log(this);
        State.events.on(DOM_EVENT_KEYDOWN, NS_STAGES, this._handleKeys.bind(this));
    }

    /**
     * @private
     */
    _handleKeys(ev) {
        console.log(this);
        let value;
        let top;
        switch (ev.keyCode) {
        case KEY_ESCAPE:
            State.flow.previousStage();
            ev.preventDefault();
            break;
        case KEY_ENTER:
            value = this.value.trim();
            top = fontHeight(
                this.label,
                MENU_LEFT,
                this._inputTop,
                this.fontOptions
            );
            this.inputSubmit(this._getInputError(value), value, top);
        }
    }

    /**
     * @param {string} val
     * @return {string}
     * @private
     */
    _getInputError(val) {
        if (val.length < this.minlength) {
            return "Too short!!";
        } else if (this.maxChars && val.length > this.maxChars) {
            return "Too long!!";
        }
        return "";
    }

    /**
     * @return {Shape}
     * @private
     */
    _getShape() {
        const shape = this._getShapeExcludeValue();
        shape.add(this._getDataShape().pixels);
        return shape;
    }

    /**
     * @return {Shape}
     * @private
     */
    _getShapeExcludeValue() {
        let pixels = fontPixels(this.header);
        pixels = zoom(2, pixels, MENU_LEFT, MENU_TOP);
        return new Shape(pixels);
    }

    /**
     * @return {Shape}
     * @private
     */
    _getDataShape() {
        const value = this.label + this.value;
        return new Shape(fontPixels(
            value, MENU_LEFT, this._inputTop, this.fontOptions
        ));
    }

}

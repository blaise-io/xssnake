import { PixelCollection } from "../../shared/pixelCollection";
import { Shape } from "../../shared/shape";
import { line } from "../../shared/shapeGenerator";
import { KEY, MENU_POS, NS } from "../const";
import { COPY_DIALOG_CANCEL, COPY_DIALOG_OK } from "../copy/copy";
import { State } from "../state";
import { stylizeUpper } from "../util/clientUtil";
import { fontPixels, fontWidth, MAX_HEIGHT } from "./font";
import { center } from "./shapeClient";
import { outline, zoom } from "./transformClient";

export const enum DialogType {
    INFO, // No buttons, not closable
    ALERT, // OK button, closable
    CONFIRM, // OK and CANCEL button
}

export interface DialogSettings {
    keysBlocked: boolean;
    type: DialogType;
    width: number;
    ok: () => void;
    cancel: () => void;
}

/**
 * @param {string} header
 * @param {string} body
 * @param {DialogSettings=} settings
 * @constructor
 */
export class Dialog {
    private settings: DialogSettings;
    private _body: string;
    private _okSelected = false;

    constructor(public header: string, body: string, settings: Partial<DialogSettings> = {}) {
        this.header = stylizeUpper(header);
        this._body = body;

        // TODO: Make class.
        this.settings = {
            keysBlocked: true,
            type: DialogType.INFO,
            width: 80,
            ok: () => {},
            cancel: () => {},
        };

        Object.assign(this.settings, settings);

        this._bindEvents();
        this._updateShape();
        // TODO: Play a bubble sound
    }

    destruct(): void {
        delete State.shapes.dialog;
        State.keysBlocked = false;
        State.events.off("keydown", NS.DIALOG);
    }

    // restore(): void {
    //     this._bindEvents();
    //     this._updateShape();
    // }

    ok(): void {
        this.destruct();
        this.settings.ok();
    }

    cancel(): void {
        this.destruct();
        this.settings.cancel();
    }

    //    setHeader(header: string) {
    //        State.audio.play('menu_alt');
    //        this._header = stylizeUpper(header)();
    //        this._updateShape();
    //    }
    //

    set body(body: string) {
        State.audio.play("menu_alt");
        this._body = body;
        this._updateShape();
    }

    private _bindEvents(): void {
        State.keysBlocked = this.settings.keysBlocked;
        if (this.settings.type !== DialogType.INFO) {
            State.events.on("keydown", NS.DIALOG, this._handleKeys.bind(this));
        }
        if (this.settings.type === DialogType.ALERT) {
            this._okSelected = true;
        } else if (this.settings.type === DialogType.CONFIRM) {
            this._okSelected = false;
        }
    }

    private _handleKeys(event: KeyboardEvent): void {
        switch (event.key) {
            case KEY.LEFT:
            case KEY.UP:
            case KEY.DOWN:
            case KEY.RIGHT:
            case KEY.TAB:
                if (this.settings.type === DialogType.CONFIRM) {
                    State.audio.play("menu_alt");
                    this._okSelected = !this._okSelected;
                    this._updateShape();
                }
                break;
            case KEY.BACKSPACE:
            case KEY.ESCAPE:
                if (this.settings.type === DialogType.CONFIRM) {
                    this.cancel();
                } else {
                    this.ok();
                }
                break;
            case KEY.ENTER:
            case KEY.SPACE:
                if (this._okSelected) {
                    this.ok();
                } else {
                    this.cancel();
                }
                break;
        }
    }

    private _getContentWidth(): number {
        return Math.max(this.settings.width, -2 + fontWidth(this.header) * 2);
    }

    private _getButtonPosition(): number {
        const bodyBBox = this._getBodyPixels().bbox();
        return MAX_HEIGHT * 3 + bodyBBox.height + 4;
    }

    private _getHeaderPixels(): PixelCollection {
        let header = fontPixels(this.header, 0, 0);
        header = zoom(2, header, 0, 0);
        return header;
    }

    private _getBodyPixels(): PixelCollection {
        const settings = { wrap: this._getContentWidth() };
        const y = 1 + MAX_HEIGHT * 2;
        return fontPixels(this._body, 0, y, settings);
    }

    private _getLine(y: number): PixelCollection {
        return line(0, y - 5, this._getContentWidth(), y - 5);
    }

    private _getCancelButton(x: number, y: number): PixelCollection {
        const settings = { invert: !this._okSelected };
        return fontPixels(COPY_DIALOG_CANCEL, x, y, settings);
    }

    private _getOkButton(x: number, y: number): PixelCollection {
        const settings = { invert: this._okSelected };
        return fontPixels(COPY_DIALOG_OK, x, y, settings);
    }

    private _getAlertPixels(): PixelCollection {
        const y = this._getButtonPosition();
        const ok = this._getOkButton(1, y);
        const line = this._getLine(y);

        return new Shape(ok, line).pixels;
    }

    private _getConfirmPixels(): PixelCollection {
        const x = fontWidth(COPY_DIALOG_CANCEL) + 5;
        const y = this._getButtonPosition();
        const cancel = this._getCancelButton(1, y);
        const ok = this._getOkButton(x, y);
        const line = this._getLine(y);

        return new Shape(ok, cancel, line).pixels;
    }

    private _updateShape(): void {
        let buttons = new PixelCollection();
        const header = this._getHeaderPixels();
        const body = this._getBodyPixels();

        switch (this.settings.type) {
            case DialogType.ALERT:
                buttons = this._getAlertPixels();
                break;
            case DialogType.CONFIRM:
                buttons = this._getConfirmPixels();
                break;
        }

        const shape = new Shape(header, body, buttons);
        shape.flags.isOverlay = true;
        shape.transform.translate[1] = MENU_POS.TOP - 2;

        outline(shape);
        center(shape);

        State.shapes.dialog = shape;
    }
}

import { PixelCollection } from "../../shared/pixelCollection";
import { Shape } from "../../shared/shape";
import { line } from "../../shared/shapeGenerator";
import {
    DOM_EVENT_KEYDOWN,
    KEY_BACKSPACE,
    KEY_DOWN,
    KEY_ENTER,
    KEY_ESCAPE,
    KEY_LEFT,
    KEY_RIGHT,
    KEY_SPACE,
    KEY_TAB,
    KEY_UP,
    MENU_TOP,
    NS_DIALOG,
} from "../const";
import { COPY_DIALOG_CANCEL, COPY_DIALOG_OK } from "../copy/copy";
import { ClientState } from "../state/clientState";
import { fontPixels, fontWidth, MAX_HEIGHT } from "./font";
import { center } from "./shapeClient";
import { outline, zoom } from "./transformClient";

export enum DialogType {
    INFO, // No buttons, not closable
    ALERT, // OK button, closable
    CONFIRM, // OK and CANCEL button
}

export interface DialogSettings {
    keysBlocked?: boolean;
    type?: DialogType;
    width?: number;
    ok?: () => void;
    cancel?: () => void;
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
    private _okSelected: boolean;

    constructor(public header: string, body: string, settings: DialogSettings = {}) {
        this.header = header.toUpperCase();
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
        ClientState.shapes.dialog = null;
        ClientState.keysBlocked = false;
        ClientState.events.off(DOM_EVENT_KEYDOWN, NS_DIALOG);
    }

    restore(): void {
        this._bindEvents();
        this._updateShape();
    }

    ok(): void {
        this.destruct();
        this.settings.ok();
    }

    cancel(): void {
        this.destruct();
        this.settings.cancel();
    }

    //    /**
    //     * @param {string} header
    //     */
    //    setHeader(header) {
    //        State.audio.play('menu_alt');
    //        this._header = header.toUpperCase();
    //        this._updateShape();
    //    }
    //

    set body(body: string) {
        ClientState.audio.play("menu_alt");
        this._body = body;
        this._updateShape();
    }

    private _bindEvents(): void {
        ClientState.keysBlocked = this.settings.keysBlocked;
        if (this.settings.type !== DialogType.INFO) {
            ClientState.events.on(DOM_EVENT_KEYDOWN, NS_DIALOG, this._handleKeys.bind(this));
        }
        if (this.settings.type === DialogType.ALERT) {
            this._okSelected = true;
        } else if (this.settings.type === DialogType.CONFIRM) {
            this._okSelected = false;
        }
    }

    private _handleKeys(ev: KeyboardEvent): void {
        switch (ev.keyCode) {
            case KEY_LEFT:
            case KEY_UP:
            case KEY_DOWN:
            case KEY_RIGHT:
            case KEY_TAB:
                if (this.settings.type === DialogType.CONFIRM) {
                    ClientState.audio.play("menu_alt");
                    this._okSelected = !this._okSelected;
                    this._updateShape();
                }
                break;
            case KEY_BACKSPACE:
            case KEY_ESCAPE:
                if (this.settings.type === DialogType.CONFIRM) {
                    this.cancel();
                } else {
                    this.ok();
                }
                break;
            case KEY_ENTER:
            case KEY_SPACE:
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
        let header;
        header = fontPixels(this.header, 0, 0);
        header = zoom(2, header, 0, 0);
        return header;
    }

    private _getBodyPixels(): PixelCollection {
        let y;
        const settings = { wrap: this._getContentWidth() };
        y = 1 + MAX_HEIGHT * 2;
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
        shape.transform.translate[1] = MENU_TOP - 2;

        outline(shape);
        center(shape);

        ClientState.shapes.dialog = shape;
    }
}

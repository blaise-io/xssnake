import { PixelCollection } from "../../shared/pixelCollection";
import { Shape } from "../../shared/shape";
import { line } from "../../shared/shapeGenerator";
import { _ } from "../../shared/util";
import { KEY, NS } from "../const";
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

        this.bindEvents();
        this.updateShape();
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
        this.updateShape();
    }

    private bindEvents(): void {
        State.keysBlocked = this.settings.keysBlocked;
        if (this.settings.type !== DialogType.INFO) {
            State.events.on("keydown", NS.DIALOG, this.handleKeys.bind(this));
        }
        if (this.settings.type === DialogType.ALERT) {
            this._okSelected = true;
        } else if (this.settings.type === DialogType.CONFIRM) {
            this._okSelected = false;
        }
    }

    private handleKeys(event: KeyboardEvent): void {
        switch (event.key) {
            case KEY.LEFT:
            case KEY.UP:
            case KEY.DOWN:
            case KEY.RIGHT:
            case KEY.TAB:
                if (this.settings.type === DialogType.CONFIRM) {
                    State.audio.play("menu_alt");
                    this._okSelected = !this._okSelected;
                    this.updateShape();
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

    private get contentWidth(): number {
        return Math.max(this.settings.width, fontWidth(this.header) * 2 - 3);
    }

    private get buttonPositionTop(): number {
        const bodyBBox = this.bodyPixels.bbox();
        return MAX_HEIGHT * 3 + bodyBBox.height + 4;
    }

    private get headerPixels(): PixelCollection {
        let header = fontPixels(this.header, 0, 0);
        header = zoom(2, header, 0, 0);
        return header;
    }

    private get bodyPixels(): PixelCollection {
        const settings = { wrap: this.contentWidth };
        const y = 1 + MAX_HEIGHT * 2;
        return fontPixels(this._body, 0, y, settings);
    }

    private getLine(y: number): PixelCollection {
        return line(0, y - 5, this.contentWidth, y - 5);
    }

    private getCancelButton(x: number, y: number): PixelCollection {
        const settings = { invert: !this._okSelected };
        return fontPixels(stylizeUpper(_("Cancel")), x, y, settings);
    }

    private getOkButton(x: number, y: number): PixelCollection {
        const settings = { invert: this._okSelected };
        return fontPixels(stylizeUpper(_("Ok")), x, y, settings);
    }

    private get buttonsAlert(): PixelCollection {
        const y = this.buttonPositionTop;
        const ok = this.getOkButton(1, y);
        const line = this.getLine(y);

        return new Shape(ok, line).pixels;
    }

    private get buttonsConfirm(): PixelCollection {
        const x = fontWidth(stylizeUpper("Cancel")) + 5;
        const y = this.buttonPositionTop;
        const cancel = this.getCancelButton(1, y);
        const ok = this.getOkButton(x, y);
        const line = this.getLine(y);

        return new Shape(ok, cancel, line).pixels;
    }

    private updateShape(): void {
        let buttons = new PixelCollection();
        const header = this.headerPixels;
        const body = this.bodyPixels;

        switch (this.settings.type) {
            case DialogType.ALERT:
                buttons = this.buttonsAlert;
                break;
            case DialogType.CONFIRM:
                buttons = this.buttonsConfirm;
                break;
        }

        const shape = new Shape(header, body, buttons);
        shape.flags.isOverlay = true;

        center(shape);
        outline(shape);

        shape.bbox(-1); // Don't clear outside rounded corners

        State.shapes.dialog = shape;
    }
}

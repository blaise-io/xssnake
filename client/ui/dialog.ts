import { HEIGHT } from "../../shared/const";
import { PixelCollection } from "../../shared/pixelCollection";
import { Shape } from "../../shared/shape";
import { line } from "../../shared/shapeGenerator";
import { extend } from "../../shared/util";
import {
    DOM_EVENT_KEYDOWN, KEY_BACKSPACE, KEY_DOWN, KEY_ENTER, KEY_ESCAPE, KEY_LEFT, KEY_RIGHT, KEY_SPACE, KEY_TAB, KEY_UP,
    MENU_TOP,
    NS_DIALOG
} from "../const";
import { COPY_DIALOG_CANCEL, COPY_DIALOG_OK } from "../copy/copy";
import { State } from "../state/state";
import { fontPixels, fontWidth, MAX_HEIGHT } from "./font";
import { zoom } from "./transformClient";

/**
 * @param {string} header
 * @param {string} body
 * @param {DialogSettings=} settings
 * @constructor
 */
export class Dialog {
    private settings: any;
    private _body: any;
    private _okSelected: boolean;

    constructor(public header: string, public body: string, settings={}) {
        this.header = header.toUpperCase();
        this._body = body;

        /** @type {DialogSettings} */
        this.settings = {
            keysBlocked: true,
            type       : Dialog.TYPE.INFO,
            width      : 80,
            ok         : () => {},
            cancel     : () => {}
        };

        extend(this.settings, settings);

        this._bindEvents();
        this._updateShape();
        // TODO: Play a bubble sound
    }

    /** @enum {number} */
    static TYPE = {
        INFO   : 0, // No buttons, not closable
        ALERT  : 1, // OK button, closable
        CONFIRM: 2  // OK and CANCEL button
    }

    destruct() {
        State.shapes.dialog = null;
        State.keysBlocked = false;
        State.events.off(DOM_EVENT_KEYDOWN, NS_DIALOG);
    }

    restore() {
        this._bindEvents();
        this._updateShape();
    }

    ok() {
        this.destruct();
        this.settings.ok();
    }

    cancel() {
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
    /**
     * @param {string} body
     */
    setBody(body) {
        State.audio.play('menu_alt');
        this._body = body;
        this._updateShape();
    }

    /**
     * @private
     */
    _bindEvents() {
        State.keysBlocked = this.settings.keysBlocked;
        if (this.settings.type !== Dialog.TYPE.INFO) {
            State.events.on(DOM_EVENT_KEYDOWN, NS_DIALOG, this._handleKeys.bind(this));
        }
        if (this.settings.type === Dialog.TYPE.ALERT) {
            this._okSelected = true;
        } else if (this.settings.type === Dialog.TYPE.CONFIRM) {
            this._okSelected = false;
        }
    }

    /**
     * @param {Event} ev
     * @private
     */
    _handleKeys(ev) {
        switch (ev.keyCode) {
        case KEY_LEFT:
        case KEY_UP:
        case KEY_DOWN:
        case KEY_RIGHT:
        case KEY_TAB:
            if (this.settings.type === Dialog.TYPE.CONFIRM) {
                State.audio.play('menu_alt');
                this._okSelected = !this._okSelected;
                this._updateShape();
            }
            break;
        case KEY_BACKSPACE:
        case KEY_ESCAPE:
            if (this.settings.type === Dialog.TYPE.CONFIRM) {
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

    /**
     * @return {number}
     * @private
     */
    _getAreaHeight() {
        //        if (remoteRoom && remoteRoom.rounds.round.game && remoteRoom.rounds.round.game.level) {
        //            return remoteRoom.rounds.round.game.level.data.height * GAME_TILE;
        //        } else {
        //            return HEIGHT;
        //        }
        return Math.round(HEIGHT / 3 * 2);
    }

    /**
     * @return {number}
     * @private
     */
    _getContentWidth() {
        return Math.max(
            this.settings.width,
            -2 + fontWidth(this.header) * 2
        );
    }

    /**
     * @return {number}
     * @private
     */
    _getButtonPosition() {
        const bodyBBox = this._getBodyPixels().bbox();
        return MAX_HEIGHT * 3 + bodyBBox.height + 4;
    }

    /**
     * @return {PixelCollection}
     * @private
     */
    _getHeaderPixels() {
        let header;
        header = fontPixels(this.header, 0, 0);
        header = zoom(2, header, 0, 0);
        return header;
    }

    /**
     * @return {PixelCollection}
     * @private
     */
    _getBodyPixels() {
        let y; const settings = {wrap: this._getContentWidth()};
        y = 1 + MAX_HEIGHT * 2;
        return fontPixels(this._body, 0, y, settings);
    }

    /**
     * @param {number} y
     * @return {PixelCollection}
     * @private
     */
    _getLine(y) {
        return line(0, y - 5, this._getContentWidth(), y - 5);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {PixelCollection}
     * @private
     */
    _getCancelButton(x, y) {
        const settings = {invert: !this._okSelected};
        return fontPixels(COPY_DIALOG_CANCEL, x, y, settings);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {PixelCollection}
     * @private
     */
    _getOkButton(x, y) {
        const settings = {invert: this._okSelected};
        return fontPixels(COPY_DIALOG_OK, x, y, settings);
    }

    /**
     * @return {PixelCollection}
     * @private
     */
    _getAlertPixels() {
        let y; let ok; let line;

        y = this._getButtonPosition();
        ok = this._getOkButton(1, y);
        line = this._getLine(y);

        return new Shape(ok, line).pixels;
    }

    /**
     * @return {PixelCollection}
     * @private
     */
    _getConfirmPixels() {
        let x; let y; let cancel; let ok; let line;

        x = fontWidth(COPY_DIALOG_CANCEL) + 5;
        y = this._getButtonPosition();
        cancel = this._getCancelButton(1, y);
        ok = this._getOkButton(x, y);
        line = this._getLine(y);

        return new Shape(ok, cancel, line).pixels;
    }

    /**
     * @private
     */
    _updateShape() {
        let shape; let header; let body; let buttons = new PixelCollection();

        header = this._getHeaderPixels();
        body = this._getBodyPixels();

        switch (this.settings.type) {
        case Dialog.TYPE.ALERT:
            buttons = this._getAlertPixels();
            break;
        case Dialog.TYPE.CONFIRM:
            buttons = this._getConfirmPixels();
            break;
        }

        shape = new Shape(header, body, buttons);
        shape.isOverlay = true;

        shape.outline();
        shape.center(0, 0);
        shape.transform.translate[1] = MENU_TOP - 2;

        State.shapes.dialog = shape;
    }

}


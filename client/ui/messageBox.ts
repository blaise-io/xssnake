import { HEIGHT, WIDTH } from "../../shared/const";
import { Player } from "../../shared/room/player";
import { Shape } from "../../shared/shape";
import { DOM_EVENT_KEYDOWN, FRAME, KEY_ENTER, KEY_ESCAPE, NS_CHAT, UC_ENTER_KEY } from "../const";
import { Message } from "../room/message";
import { InputField } from "../stage_class_helper/inputField";
import { State } from "../state/state";
import { font, fontPixels, fontWidth } from "./font";
import { animate, flash, lifetime } from "./shapeClient";

export class MessageBoxUI {
    private animating: boolean;
    private skipQueue: boolean;
    private queued: number;
    private inputField: InputField;
    sendMessageFn: any;
    private lineHeight: number;
    private animationDuration: number;
    private x0: number;
    private x1: number;
    private y0: number;
    private y1: number;
    private padding: { y0: number; x0: number; y1: number; x1: number };

    constructor(public messages: Message[], public localAuthor: Player) {
        this.animating = false;
        this.skipQueue = false;
        this.queued = 0;

        this.inputField = null;
        this.sendMessageFn = () => {};

        this.lineHeight = 7;
        this.animationDuration = 200;

        this.x0 = 109;
        this.x1 = WIDTH - 2;
        this.y0 = HEIGHT - 25;
        this.y1 = HEIGHT - 2;

        this.padding = { x0: 0, x1: 0, y0: 1, y1: 1 };

        this.bindEvents();
        this.updateMessages();
    }

    destruct() {
        State.events.off(DOM_EVENT_KEYDOWN, NS_CHAT);
        if (this.inputField) {
            this.inputField.destruct();
            this.inputField = null;
        }
    }

    bindEvents() {
        State.events.on(DOM_EVENT_KEYDOWN, NS_CHAT, this.handleKeys.bind(this));
    }

    handleKeys(ev) {
        switch (ev.keyCode) {
            case KEY_ESCAPE:
                this.hideInput();
                this.hideEnterKey();
                ev.preventDefault();
                break;
            case KEY_ENTER:
                if (this.inputField) {
                    this.sendMessage(this.inputField.getValue());
                    this.hideInput();
                } else if (!State.keysBlocked) {
                    this.showInput();
                }
                ev.preventDefault();
                break;
        }
    }

    showInput() {
        let x;
        let y;
        let prefix;

        x = this.x0 + this.padding.x1 + new Message("", "").getOffset();
        y = this.y1 - this.padding.y1 - this.lineHeight;
        prefix = this.localAuthor.name + ": ";

        this.inputField = new InputField(x, y, prefix);
        this.inputField.maxValWidth = this.x1 - x - fontWidth(prefix);
        this.inputField.maxValWidth -= this.padding.x0 + this.padding.x1;
        this.inputField.displayWidth = this.inputField.maxValWidth;
        this.inputField.displayWidth -= fontWidth(UC_ENTER_KEY) + 1;
        this.inputField.setValue("");

        this.updateMessages();
        this.showEnterKey();
    }

    hideInput() {
        if (this.inputField) {
            this.inputField.destruct();
            this.inputField = null;
        }
        this.updateMessages();
    }

    sendMessage(body) {
        const author = String(this.localAuthor.name);
        if (body.trim()) {
            this.messages.push(new Message(author, body));
            this.sendMessageFn(body);
            this.skipQueue = true;
        }
        this.hideEnterKey(!!body.trim());
    }

    showEnterKey() {
        const x = this.x1 - this.padding.x1 - fontWidth(UC_ENTER_KEY);
        const y = this.y1 - this.lineHeight - this.padding.y1 + 1;

        const shape = (State.shapes.MSG_ENTER = font(UC_ENTER_KEY, x, y));
        shape.invert(shape.bbox(2));
        shape.flags.isOverlay = true;
    }

    /**
     * @param {boolean=} flashKey
     */
    hideEnterKey(flashKey?: boolean): void {
        const speed = FRAME * 4;
        if (flashKey) {
            flash(State.shapes.MSG_ENTER, speed, speed);
            lifetime(State.shapes.MSG_ENTER, 0, speed);
        } else {
            State.shapes.MSG_ENTER = null;
        }
    }

    getDisplayMessages(num) {
        return this.messages.slice(-num - 1 - this.queued, this.messages.length - this.queued);
    }

    getNumMessagesFit() {
        let fits = this.y1 - this.padding.y1 - (this.y0 + this.padding.y0);
        fits = Math.floor(fits / this.lineHeight);
        fits -= this.inputField === null ? 0 : 1;
        return fits;
    }

    debounceUpdate() {
        if (this.animating && !this.skipQueue) {
            this.queued++;
        } else {
            this.updateMessages();
        }
    }

    updateMessages() {
        let num;
        let shape;
        let messages;

        shape = new Shape();
        shape.mask = [
            this.x0,
            this.y0,
            this.x1,
            this.y1 - (this.inputField ? this.lineHeight - this.padding.y1 : 0),
        ];

        num = this.getNumMessagesFit();
        messages = this.getDisplayMessages(num);

        if (messages.length) {
            State.shapes.MSG_BOX = shape;
        } else {
            return false;
        }

        for (let i = 0, m = messages.length; i < m; i++) {
            shape.add(this.getMessagePixels(i, messages[i]));
        }

        if (this.skipQueue) {
            this.skipQueue = false;
            this.queued = 0;
            if (messages.length === num + 1) {
                this.animateCallback(shape);
            }
        } else if (messages.length === num + 1) {
            this.animate(shape);
        }
    }

    getMessagePixels(lineIndex, message) {
        let x;
        let y;
        x = this.x0 + this.padding.x0;
        y = this.y0 + this.padding.y0 + lineIndex * this.lineHeight;
        return fontPixels(message.getFormatted(), x + message.getOffset(), y);
    }

    animate(shape): void {
        this.animating = true;
        const anim = {
            to: [0, -this.lineHeight] as Coordinate,
            duration: this.animationDuration,
            doneCallback: this.animateCallback.bind(this),
        };
        animate(shape, anim);
    }

    animateCallback(shape) {
        shape.transform.translate = [0, -this.lineHeight];
        shape.pixels.removeLine(this.y0 + this.lineHeight);
        shape.uncache();
        setTimeout(this.processQueue.bind(this), 200);
    }

    processQueue() {
        this.animating = false;
        if (this.queued >= 1) {
            this.debounceUpdate();
            this.queued--;
        }
    }
}

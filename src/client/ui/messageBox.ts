import { CANVAS } from "../../shared/const";
import { PixelCollection } from "../../shared/pixelCollection";
import { Player } from "../../shared/room/player";
import { Shape } from "../../shared/shape";
import { KEY, UC } from "../const";
import { EventHandler } from "../util/eventHandler";
import { ChatMessage } from "../room/chatMessage";
import { InputField } from "../stages/components/inputField";
import { State } from "../state";
import { font, fontPixels, fontWidth } from "./font";
import { animate, flash, lifetime } from "./shapeClient";

export class MessageBoxUI {
    private animating = false;
    private skipQueue = false;
    private queued = 0;
    private inputField?: InputField;
    private lineHeight = 7;
    private animationDuration = 200;
    private x0 = 109;
    private x1 = CANVAS.WIDTH - 2;
    private y0 = CANVAS.HEIGHT - 25;
    private y1 = CANVAS.HEIGHT - 2;
    private padding = { x0: 0, x1: 0, y0: 1, y1: 1 };
    private eventHandler = new EventHandler();

    constructor(
        public messages: ChatMessage[],
        public localPlayer: Player,
        private sendMessageFn: (body: string) => void,
    ) {
        this.bindEvents();
        this.updateMessages();
    }

    destruct(): void {
        this.eventHandler.destruct();
        this.inputField?.destruct();
        delete this.inputField;
    }

    bindEvents(): void {
        this.eventHandler.on("keydown", this.handleKeys.bind(this));
    }

    handleKeys(event: KeyboardEvent): void {
        switch (event.key) {
            case KEY.ESCAPE:
                this.hideInput();
                this.hideEnterKey();
                event.preventDefault();
                break;
            case KEY.ENTER:
                if (this.inputField) {
                    this.sendMessage(this.inputField.value);
                    this.hideInput();
                } else if (!State.keysBlocked) {
                    this.showInput();
                }
                event.preventDefault();
                break;
        }
    }

    showInput(): void {
        const x = this.x0 + this.padding.x1;
        const y = this.y1 - this.padding.y1 - this.lineHeight;
        const prefix = this.localPlayer.name + ": ";

        this.inputField = new InputField(x, y, prefix);
        this.inputField.maxValWidth = this.x1 - x - fontWidth(prefix);
        this.inputField.maxValWidth -= this.padding.x0 + this.padding.x1;
        this.inputField.displayWidth = this.inputField.maxValWidth;
        this.inputField.displayWidth -= fontWidth(UC.ENTER_KEY) + 1;
        this.inputField.setValue("");

        this.updateMessages();
        this.showEnterKey();
    }

    hideInput(): void {
        this.inputField?.destruct();
        delete this.inputField;
        this.updateMessages();
    }

    sendMessage(body: string): void {
        const author = String(this.localPlayer.name);
        if (body.trim()) {
            this.messages.push(new ChatMessage(author, body));
            this.sendMessageFn(body);
            this.skipQueue = true;
            this.hideEnterKey(true);
        } else {
            this.hideEnterKey(false);
        }
    }

    showEnterKey(): void {
        const x = this.x1 - this.padding.x1 - fontWidth(UC.ENTER_KEY);
        const y = this.y1 - this.lineHeight - this.padding.y1 + 1;

        const shape = (State.shapes.MSG_ENTER = font(UC.ENTER_KEY, x, y));
        shape.invert(shape.bbox(2));
        shape.flags.isOverlay = true;
    }

    hideEnterKey(flashKey?: boolean): void {
        const speed = 60;
        if (flashKey) {
            if (State.shapes.MSG_ENTER) {
                flash(State.shapes.MSG_ENTER, speed, speed);
                lifetime(State.shapes.MSG_ENTER, 0, speed);
            }
        } else {
            delete State.shapes.MSG_ENTER;
        }
    }

    getDisplayMessages(num: number): ChatMessage[] {
        return this.messages.slice(-num - 1 - this.queued, this.messages.length - this.queued);
    }

    getNumMessagesFit(): number {
        let fits = this.y1 - this.padding.y1 - (this.y0 + this.padding.y0);
        fits = Math.floor(fits / this.lineHeight);
        if (this.inputField) {
            fits--;
        }
        return fits;
    }

    debounceUpdate(): void {
        if (this.animating && !this.skipQueue) {
            this.queued++;
        } else {
            this.updateMessages();
        }
    }

    updateMessages(): void {
        const num = this.getNumMessagesFit();
        const messages = this.getDisplayMessages(num);
        if (!messages.length) {
            return;
        }

        const shape = new Shape();
        const top = this.inputField ? this.lineHeight - this.padding.y1 : 0;
        shape.mask = [this.x0, this.y0, this.x1, this.y1 - top];
        State.shapes.MSG_BOX = shape;

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

    getMessagePixels(lineIndex: number, message: ChatMessage): PixelCollection {
        const x = this.x0 + this.padding.x0;
        const y = this.y0 + this.padding.y0 + lineIndex * this.lineHeight;
        return fontPixels(message.getFormatted(), x, y);
    }

    animate(shape: Shape): void {
        this.animating = true;
        const anim = {
            to: [0, -this.lineHeight] as Shift,
            duration: this.animationDuration,
            doneCallback: this.animateCallback.bind(this),
        };
        animate(shape, anim);
    }

    animateCallback(shape: Shape): void {
        shape.transform.translate = [0, -this.lineHeight];
        shape.pixels.removeLine(this.y0 + this.lineHeight);
        shape.uncache();
        setTimeout(() => {
            this.processQueue();
        }, 200);
    }

    processQueue(): void {
        this.animating = false;
        if (this.queued >= 1) {
            this.debounceUpdate();
            this.queued--;
        }
    }
}

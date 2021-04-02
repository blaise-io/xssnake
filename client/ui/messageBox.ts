/**
 * @param {Array.<room.Message>} messages
 * @param {room.Player} localAuthor
 * @constructor
 */
export class ui.MessageBox {
    constructor(messages, localAuthor) {
    this.messages = messages;
    this.localAuthor = localAuthor;

    this.animating = false;
    this.skipQueue = false;
    this.queued = 0;

    this.inputField = null;
    this.sendMessageFn = noop;

    this.lineHeight = 7;
    this.animationDuration = 200;

    this.x0 = 109;
    this.x1 = WIDTH - 2;
    this.y0 = HEIGHT - 25;
    this.y1 = HEIGHT - 2;

    this.padding = {x0: 0, x1: 0, y0: 1, y1: 1};

    this.bindEvents();
    this.updateMessages();
};



    destruct() {
        State.events.off(DOM_EVENT_KEYDOWN, NS_CHAT);
        if (this.inputField) {
            this.inputField.destruct();
            this.inputField = null;
        }
    },

    bindEvents() {
        State.events.on(DOM_EVENT_KEYDOWN, NS_CHAT, this.handleKeys.bind(this));
    },

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
    },

    showInput() {
        var x, y, prefix;

        x = this.x0 + this.padding.x1 + new Message('', '').getOffset();
        y = this.y1 - this.padding.y1 - this.lineHeight;
        prefix = this.localAuthor.name + ': ';

        this.inputField = new InputField(x, y, prefix);
        this.inputField.maxValWidth = this.x1 - x - fontWidth(prefix);
        this.inputField.maxValWidth -= this.padding.x0 + this.padding.x1;
        this.inputField.displayWidth = this.inputField.maxValWidth;
        this.inputField.displayWidth -= fontWidth(UC_ENTER_KEY) + 1;
        this.inputField.setValue('');

        this.updateMessages();
        this.showEnterKey();
    },

    hideInput() {
        if (this.inputField) {
            this.inputField.destruct();
            this.inputField = null;
        }
        this.updateMessages();
    },

    sendMessage(body) {
        var author = String(this.localAuthor.name);
        if (body.trim()) {
            this.messages.push(new Message(author, body));
            this.sendMessageFn(body);
            this.skipQueue = true;
        }
        this.hideEnterKey(!!body.trim());
    },

    showEnterKey() {
        var x, y, shape;

        x = this.x1 - this.padding.x1 - fontWidth(UC_ENTER_KEY);
        y = this.y1 - this.lineHeight - this.padding.y1 + 1;

        shape = State.shapes.MSG_ENTER = font(UC_ENTER_KEY, x, y);
        shape.invert(shape.bbox(2));
        shape.isOverlay = true;
    },

    /**
     * @param {boolean=} flash
     */
    hideEnterKey(flash) {
        var speed = FRAME * 4;
        if (flash) {
            State.shapes.MSG_ENTER.flash(speed, speed).lifetime(0, speed);
        } else {
            State.shapes.MSG_ENTER = null;
        }
    },

    getDisplayMessages(num) {
        return this.messages.slice(
            -num - 1 - this.queued,
            this.messages.length - this.queued
        );
    },

    getNumMessagesFit() {
        var fits = (this.y1 - this.padding.y1) - (this.y0 + this.padding.y0);
        fits = Math.floor(fits / this.lineHeight);
        fits -= this.inputField === null ? 0 : 1;
        return fits;
    },

    debounceUpdate() {
        if (this.animating && !this.skipQueue) {
            this.queued++;
        } else {
            this.updateMessages();
        }
    },

    updateMessages() {
        var num, shape, messages;

        shape = new Shape();
        shape.mask = [
            this.x0, this.y0, this.x1,
            this.y1 - (this.inputField ? this.lineHeight - this.padding.y1 : 0)
        ];

        num = this.getNumMessagesFit();
        messages = this.getDisplayMessages(num);

        if (messages.length) {
            State.shapes.MSG_BOX = shape;
        } else {
            return false;
        }

        for (var i = 0, m = messages.length; i < m; i++) {
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
    },

    getMessagePixels(lineIndex, message) {
        var x, y;
        x = this.x0 + this.padding.x0;
        y = this.y0 + this.padding.y0 + (lineIndex * this.lineHeight);
        return fontPixels(
            message.getFormatted(), x + message.getOffset(), y
        );
    },

    animate(shape) {
        this.animating = true;
        var anim = {
            to: [0, -this.lineHeight],
            duration: this.animationDuration,
            callback: this.animateCallback.bind(this)
        };
        shape.animate(anim);
    },

    animateCallback(shape) {
        shape.transform.translate = [0, -this.lineHeight];
        shape.pixels.removeLine(this.y0 + this.lineHeight);
        shape.uncache();
        setTimeout(this.processQueue.bind(this), 200);
    },

    processQueue() {
        this.animating = false;
        if (this.queued >= 1) {
            this.debounceUpdate();
            this.queued--;
        }
    }

};

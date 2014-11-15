'use strict';

/**
 * @param {Array.<xss.room.Message>} messages
 * @param {xss.room.Player} localAuthor
 * @constructor
 */
xss.ui.MessageBox = function(messages, localAuthor) {
    this.messages = messages;
    this.localAuthor = localAuthor;

    this.animating = false;
    this.skipQueue = false;
    this.queued = 0;

    this.inputField = null;
    this.sendMessageFn = xss.util.noop;

    this.lineHeight = 7;
    this.animationDuration = 200;

    this.x0 = 100;
    this.x1 = xss.WIDTH;
    this.y0 = xss.HEIGHT - 25;
    this.y1 = xss.HEIGHT - 2;

    this.padding = {x0: 0, x1: 0, y0: 1, y1: 1};

    this.bindEvents();
    this.debounceUpdate();
};

xss.ui.MessageBox.prototype = {

    destruct: function() {
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_CHAT);
        if (this.inputField) {
            this.inputField.destruct();
            this.inputField = null;
        }
    },

    bindEvents: function() {
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_CHAT, this.handleKeys.bind(this));
    },

    handleKeys: function(ev) {
        switch (ev.keyCode) {
            case xss.KEY_ESCAPE:
                this.hideInput();
                ev.preventDefault();
                break;
            case xss.KEY_ENTER:
                if (this.inputField) {
                    this.sendMessage(this.inputField.getValue());
                    this.hideInput();
                } else if (!xss.keysBlocked) {
                    this.showInput();
                }
                ev.preventDefault();
                break;
        }
    },

    showInput: function() {
        var x, y, prefix;

        x = this.x0 + this.padding.x1 + new xss.room.Message('', '').getOffset();
        y = this.y1 - this.padding.y1 - this.lineHeight;
        prefix = this.localAuthor.name + ': ';

        this.inputField = new xss.InputField(x, y, prefix);
        this.inputField.maxValWidth = this.x1 - x - xss.font.width(prefix);
        this.inputField.maxValWidth -= xss.font.width(xss.UC_ENTER_KEY);
        this.inputField.maxValWidth -= this.padding.x0 + this.padding.x1;
        this.inputField.setValue('');

        this.updateMessages();
    },

    hideInput: function() {
        if (this.inputField) {
            this.inputField.destruct();
            this.inputField = null;
        }
        this.updateMessages();
    },

    sendMessage: function(body) {
        if (body.trim()) {
            this.messages.push(new xss.room.Message(this.localAuthor.name, body));
            this.sendMessageFn(body);

            this.skipQueue = true;
            this.flashEnterKey();
        }
    },

    flashEnterKey: function() {
        var x, y, shape;

        x = this.x1 - this.padding.x1 - xss.font.width(xss.UC_ENTER_KEY) - 2;
        y = this.y1 - this.lineHeight - this.padding.y1 + 1;

        shape = xss.shapes.MSG_SENT = xss.font.shape(xss.UC_ENTER_KEY, x, y);
        shape.flash(100, 100).lifetime(0, 100 * 4);
    },

    getDisplayMessages: function(num) {
        return this.messages.slice(
            -num - 1 - this.queued,
            this.messages.length - this.queued
        );
    },

    getNumMessagesFit: function() {
        var fits = (this.y1 - this.padding.y1) - (this.y0 + this.padding.y0);
        fits = Math.floor(fits / this.lineHeight);
        fits -= this.inputField === null ? 0 : 1;
        return fits;
    },

    debounceUpdate: function() {
        if (this.animating && !this.skipQueue) {
            this.queued++;
        } else {
            this.updateMessages();
        }
    },

    updateMessages: function() {
        var num, shape, messages;

        shape = xss.shapes.MSG_BOX = new xss.Shape();
        shape.mask = [
            this.x0, this.y0, this.x1,
            this.y1 - (this.inputField ? this.lineHeight - this.padding.y1 : 0)
        ];

        num = this.getNumMessagesFit();
        messages = this.getDisplayMessages(num);
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

    getMessagePixels: function(lineIndex, message) {
        var x, y;
        x = this.x0 + this.padding.x0;
        y = this.y0 + this.padding.y0 + (lineIndex * this.lineHeight);
        return xss.font.pixels(
            message.getFormatted(), x + message.getOffset(), y
        );
    },

    animate: function(shape) {
        this.animating = true;
        var anim = {
            to: [0, -this.lineHeight],
            duration: this.animationDuration,
            callback: this.animateCallback.bind(this)
        };
        shape.animate(anim);
    },

    animateCallback: function(shape) {
        shape.transform.translate = [0, -this.lineHeight];
        shape.pixels.removeLine(this.y0 + this.lineHeight);
        shape.uncache();
        setTimeout(this.processQueue.bind(this), 200);
    },

    processQueue: function() {
        this.animating = false;
        if (this.queued >= 1) {
            this.debounceUpdate();
            this.queued--;
        }
    }
    
};

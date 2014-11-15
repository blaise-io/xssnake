'use strict';

/**
 * @param {Array.<xss.room.Message>} messages
 * @constructor
 */
xss.ui.MessageBox = function(messages) {
    this.messages = messages;
    this.animating = false;
    this.queued = 0;

    this.localAuthor = xss.player ? xss.player.name : xss.util.getRandomName();
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
        var prefix = this.localAuthor + ': ';
        this.inputField = new xss.InputField(
            this.x0 + this.padding.x1,
            this.y1 - this.padding.y1 - this.lineHeight,
            prefix
        );
        this.inputField.maxValWidth = this.x1 - xss.font.width(prefix) - this.x0;
        this.inputField.maxValWidth -= 8; // LB icon
        this.inputField.maxValWidth -= this.padding.x0 + this.padding.x1;
        this.inputField.setValue('');
        this.updateMessages();
    },

    hideInput: function() {
        this.inputField.destruct();
        this.inputField = null;
        this.updateMessages();
    },

    sendMessage: function(message) {
        this.messages.push(new xss.room.Message(this.localAuthor, message));
        this.sendMessageFn(message);
    },

    getNumMessagesFit: function() {
        var fits = (this.y1 - this.padding.y1) - (this.y0 + this.padding.y0);
        fits = Math.floor(fits / this.lineHeight);
        fits -= this.inputField === null ? 0 : 1;
        return fits;
    },

    debounceUpdate: function() {
        if (this.animating) {
            this.queued++;
        } else {
            this.updateMessages();
        }
    },

    updateMessages: function() {
        var fits, shape, displaymessages;

        fits = this.getNumMessagesFit();

        shape = new xss.Shape();
        shape.mask = [
            this.x0, this.y0, this.x1,
            this.inputField === null ? this.y1 : this.y1 - this.lineHeight - this.padding.y1
        ];

        xss.shapes.messageBox = shape;

        displaymessages = this.messages.slice(
            -fits - 1 - this.queued,
            this.messages.length - this.queued
        );

        for (var i = 0, m = displaymessages.length; i < m; i++) {
            shape.add(this.getMessagePixels(i, displaymessages[i]));
        }

        if (displaymessages.length === fits + 1) {
            this.animate(shape);
        }
    },

    formatMessage: function(message) {
        if (message) {
            return message.author + ': ' + message.body;
        } else {
            return '';
        }
    },

    getMessagePixels: function(lineIndex, message) {
        var x, y;
        x = this.x0 + this.padding.x0;
        y = this.y0 + this.padding.y0 + (lineIndex * this.lineHeight);
        return xss.font.pixels(this.formatMessage(message), x, y);
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

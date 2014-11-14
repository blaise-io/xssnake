'use strict';

/**
 * @param {Array.<xss.room.Message>} messages
 * @constructor
 */
xss.ui.MessageBox = function(messages) {
    this.messages = messages;
    this.animating = false;
    this.queued = 0;

    this.lineHeight = 7;
    this.animationDuration = 250;

    this.paddingTop = 2;

    this.x0 = 100;
    this.x1 = xss.WIDTH;
    this.y0 = xss.HEIGHT - 24;
    this.y1 = xss.HEIGHT - 3;

    this.calculateNumMessagesFit();
    this.updateMessages();
};

xss.ui.MessageBox.prototype = {

    calculateNumMessagesFit: function() {
        this.fitsMessages = Math.floor((this.y1 - this.y0) / this.lineHeight);
    },

    updateMessages: function() {
        var shape, displaymessages;

        if (this.animating) {
            this.queued++;
            return;
        }

        xss.shapes.messageBox = shape = new xss.Shape();

        displaymessages = this.messages.slice(
            -this.fitsMessages - 1 - this.queued,
            this.messages.length - this.queued
        );

        for (var i = 0, m = displaymessages.length; i < m; i++) {
            shape.add(this.getMessagePixels(i, displaymessages[i]));
        }

        if (displaymessages.length === this.fitsMessages + 1) {
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
        var y = this.y0 + (lineIndex * this.lineHeight);
        return xss.font.pixels(this.formatMessage(message), this.x0, y);
    },

    animate: function(shape) {
        this.animating = true;
        var anim = {
            to: [0, -this.lineHeight],
            duration: this.animationDuration,
            progress: this.cutOverflowTop.bind(this),
            callback: this.animateCallback.bind(this)
        };
        shape.animate(anim);
    },

    cutOverflowTop: function(shape, x, y) {
        shape.pixels.removeLine(this.y0 - y - this.paddingTop);
        shape.pixels.removeLine(this.y0 - y - this.paddingTop - 1);
        shape.uncache();
    },

    animateCallback: function(shape) {
        shape.pixels.removeLine(this.y0 + this.lineHeight - 1);
        shape.uncache();
        setTimeout(this.processQueue.bind(this), 200);
    },

    processQueue: function() {
        this.animating = false;
        if (this.queued >= 1) {
            this.updateMessages();
            this.queued--;
        }
    }
    
};

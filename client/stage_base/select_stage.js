'use strict';

/**
 * xss.SelectStage
 * Stage with a vertical select menu
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.SelectStage = function() {
};

xss.SelectStage.prototype = {

    menu: null,

    getShape: function() {
        return this.menu.getShape();
    },

    getData: function() {
        return {};
    },

    construct: function() {
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES, this.handleKeys.bind(this));
    },

    destruct: function() {
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES);
        xss.shapes.stage = null;
    },

    handleKeys: function(ev) {
        if (xss.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case xss.KEY_BACKSPACE:
            case xss.KEY_ESCAPE:
                xss.flow.previousStage();
                break;
            case xss.KEY_ENTER:
                var next = this.menu.getNextStage();
                if (next) {
                    xss.flow.switchStage(next);
                } else {
                    xss.flow.previousStage();
                }
                break;
            case xss.KEY_UP:
                this.menu.prev();
                xss.audio.play('menu');
                xss.flow.refreshShapes();
                break;
            case xss.KEY_DOWN:
                this.menu.next();
                xss.audio.play('menu');
                xss.flow.refreshShapes();
        }
    }

};

'use strict';

/**
 * Basexss.ScreenStage
 * Stage with static content
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.ScreenStage = function() {
};

xss.ScreenStage.prototype = {

    /** @type {xss.Shape} */
    screen: null,

    getShape: function() {
        return this.screen;
    },

    getData: function() {
        return {};
    },

    construct: function() {
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES, this._handleKeys);
    },

    destruct: function() {
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES);
        xss.shapes.stage = null;
    },

    _handleKeys: function(ev) {
        switch (ev.keyCode) {
            case xss.KEY_BACKSPACE:
            case xss.KEY_ESCAPE:
            case xss.KEY_ENTER:
                xss.flow.previousStage();
        }
    }

};

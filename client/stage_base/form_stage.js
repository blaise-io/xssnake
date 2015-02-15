'use strict';

/**
 * Stage with a vertical form
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.FormStage = function() {
};

xss.FormStage.prototype = {

    /** @type {xss.Form} */
    form: null,

    getShape: function() {
        return this.form.getShape();
    },

    getData: function() {
        return {};
    },

    /**
     * @param {Function} data
     * @return {Function}
     * @private
     */
    getNextStage: function(data) {
        return data;
    },

    construct: function() {
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES, this._handleKeys.bind(this));
    },

    destruct: function() {
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES);
        xss.shapes.stage = null;
    },

    _handleKeys: function(ev) {
        if (xss.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case xss.KEY_BACKSPACE:
            case xss.KEY_ESCAPE:
                xss.flow.previousStage();
                break;
            case xss.KEY_ENTER:
                var next = this.getNextStage(this.form.getData());
                xss.flow.switchStage(next);
                break;
            case xss.KEY_UP:
                this.form.selectField(-1);
                xss.audio.play('menu');
                xss.flow.refreshShapes();
                break;
            case xss.KEY_DOWN:
                this.form.selectField(1);
                xss.audio.play('menu');
                xss.flow.refreshShapes();
                break;
            case xss.KEY_LEFT:
                this.form.selectOption(-1);
                xss.audio.play('menu_alt');
                xss.flow.refreshShapes();
                break;
            case xss.KEY_RIGHT:
                this.form.selectOption(1);
                xss.audio.play('menu_alt');
                xss.flow.refreshShapes();
                break;
        }
    }

};

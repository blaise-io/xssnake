/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST*/
'use strict';

/**
 * Stage with a vertical form
 * @implements {StageInterface}
 * @constructor
 */
function FormStage() {}

FormStage.prototype = {

    /** @type {Form} */
    form: null,

    getShape: function() {
        return this.form.getShape();
    },

    getData: function() {
        return {};
    },

    /**
     * @param {Object} data
     * @returns {Object|null}
     * @private
     */
    getNextStage: function(data) {
        return data;
    },

    construct: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this._handleKeys.bind(this));
    },

    destruct: function() {
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.stage = null;
    },

    _handleKeys: function(ev) {
        if (XSS.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case CONST.KEY_BACKSPACE:
            case CONST.KEY_ESCAPE:
                XSS.flow.previousStage();
                break;
            case CONST.KEY_ENTER:
                var next = this.getNextStage(this.form.getData());
                XSS.flow.switchStage(next);
                break;
            case CONST.KEY_UP:
                this.form.selectField(-1);
                XSS.play.menu();
                XSS.flow.refreshShapes();
                break;
            case CONST.KEY_DOWN:
                this.form.selectField(1);
                XSS.play.menu();
                XSS.flow.refreshShapes();
                break;
            case CONST.KEY_LEFT:
                this.form.selectOption(-1);
                XSS.play.menu_alt();
                XSS.flow.refreshShapes();
                break;
            case CONST.KEY_RIGHT:
                this.form.selectOption(1);
                XSS.play.menu_alt();
                XSS.flow.refreshShapes();
                break;
        }
    }

};

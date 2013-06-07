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

    storageKey: null,

    getShape: function() {
        return this.form.getShape();
    },

    construct: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this.handleKeys.bind(this));
    },

    destruct: function() {
        XSS.util.storage(this.storageKey, this.form.getValues());
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.stage = null;
    },

    handleKeys: function(ev) {
        if (XSS.keysBlocked) {
            return;
        }
        switch (ev.keyCode) {
            case CONST.KEY_BACKSPACE:
            case CONST.KEY_ESCAPE:
                XSS.flow.previousStage();
                break;
            case CONST.KEY_ENTER:
                var next = this.form.getNextStage();
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

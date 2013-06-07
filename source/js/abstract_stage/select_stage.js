/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, SelectMenu*/
'use strict';

/**
 * SelectStage
 * Stage with a vertical select menu
 * @implements {StageInterface}
 * @constructor
 */
function SelectStage() {}

SelectStage.prototype = {

    menu: null,

    getShape: function() {
        return this.menu.getShape();
    },

    getData: function() {
        return {};
    },

    construct: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this.handleKeys.bind(this));
    },

    destruct: function() {
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
                var next = this.menu.getNextStage();
                if (next) {
                    XSS.flow.switchStage(next);
                } else {
                    XSS.flow.previousStage();
                }
                break;
            case CONST.KEY_UP:
                this.menu.prev();
                XSS.play.menu();
                XSS.flow.refreshShapes();
                break;
            case CONST.KEY_DOWN:
                this.menu.next();
                XSS.play.menu();
                XSS.flow.refreshShapes();
        }
    }

};

/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST*/
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

    construct: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this.handleKeys.bind(this));
    },

    destruct: function() {
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.stage = null;
    },

    handleKeys: function(e) {
        if (XSS.keysBlocked) {
            return;
        }
        switch (e.keyCode) {
            case CONST.KEY_BACKSPACE:
            case CONST.KEY_ESCAPE:
                XSS.flow.previousStage();
                break;
            case CONST.KEY_ENTER:
                var nextStage = this.menu.getNextStage();
                if (nextStage) {
                    XSS.flow.switchStage(nextStage);
                } else {
                    XSS.flow.previousStage();
                }
                break;
            case CONST.KEY_UP:
                this.menu.select(-1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
                break;
            case CONST.KEY_DOWN:
                this.menu.select(1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
        }
    }

};

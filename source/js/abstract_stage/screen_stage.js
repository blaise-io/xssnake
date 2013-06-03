/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST*/
'use strict';

/**
 * BaseScreenStage
 * Stage with static content
 * @implements {StageInterface}
 * @constructor
 */
function ScreenStage() {}

ScreenStage.prototype = {

    /** @type {Shape} */
    screen: null,

    getShape: function() {
        return this.screen;
    },

    construct: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this._handleKeys);
    },

    destruct: function() {
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.stage = null;
    },

    _handleKeys: function(e) {
        switch (e.keyCode) {
            case CONST.KEY_BACKSPACE:
            case CONST.KEY_ESCAPE:
            case CONST.KEY_ENTER:
                XSS.flow.previousStage();
        }
    }

};

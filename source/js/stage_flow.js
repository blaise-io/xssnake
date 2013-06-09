/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, MainStage*/
'use strict';

/**
 * StageFlow instantiation, stage switching
 * @param {Function=} Stage
 * @constructor
 */
function StageFlow(Stage) {
    this._FirstStage = Stage || MainStage;

    if (XSS.font.loaded) {
        this.start();
    } else {
        XSS.event.once(
            CONST.PUB_FONT_LOAD,
            CONST.NS_FLOW,
            this.start.bind(this)
        );
    }
}

StageFlow.prototype = {

    destruct: function() {
        this.stage.destruct();
        if (XSS.socket) {
            XSS.socket.destruct();
        }
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_FLOW);
        XSS.canvas.garbageCollect();
    },

    restart: function() {
        this.destruct();
        this.start();
    },

    start: function() {
        XSS.shapes = {};
        this._history = [];
        this._bindGlobalEvents();
        this._setupMenuSkeletton();
        this._setStage(new this._FirstStage(), false);
    },

    getData: function() {
        var value = {};
        for (var i = 0, m = this._history.length; i < m; i++) {
            XSS.util.extend(value, this._history[i].getData());
        }
        return value;
    },

    /**
     * @param {Function} Stage
     * @param {Object=} options
     */
    switchStage: function(Stage, options) {
        var switchToStage;

        options = options || {};

        if (Stage && !options.back) {
            switchToStage = new Stage();
        } else {
            switchToStage = this._history[this._history.length - 2];
        }

        // Unload old stage
        this.stage.destruct();

        // Remove everything
        XSS.shapes.stage = null;

        // Replace by animation
        this._switchStageAnimate(
            this.stage.getShape(),
            switchToStage.getShape(),
            options.back,
            function() {
                this._setStage(switchToStage, options.back);
            }.bind(this)
        );
    },

    previousStage: function() {
        if (this._history.length > 1) {
            this.switchStage(null, {back: true});
        }
    },

    refreshShapes: function() {
        XSS.shapes.stage = this.stage.getShape();
    },

    _setupMenuSkeletton: function() {
        var border = XSS.shapegen.outerBorder();
        for (var k in border) {
            if (border.hasOwnProperty(k)) {
                XSS.shapes[k] = border[k];
            }
        }
        XSS.shapes.header = XSS.shapegen.header();
    },

    /**
     * @private
     */
    _bindGlobalEvents: function() {
        window.onhashchange = this._hashChange.bind(this);
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_FLOW, this._handleKeys.bind(this));
    },

    /**
     * @private
     */
    _hashChange: function() {
        if (
            XSS.util.hash(CONST.HASH_ROOM).length === CONST.ROOM_KEY_LENGTH &&
            1 === this._history.length
        ) {
            XSS.flow.restart();
        }
    },

    /**
     * @param {Event} ev
     * @private
     */
    _handleKeys: function(ev) {
        var mute, instruct;

        // Firefox disconnects websocket on Esc. Disable that.
        if (ev.keyCode === CONST.KEY_ESCAPE) {
            ev.preventDefault();
        }

        // Global mute key.
        // Ignore key when user is in input field. Start screen might
        // contain a dialog, so do not use XSS.keysBlocked here.
        if (!XSS.shapes.caret && ev.keyCode === CONST.KEY_MUTE) {
            mute = !XSS.util.storage(CONST.STORAGE_MUTE);
            instruct = 'Sounds ' + (mute ? 'muted' : 'unmuted');
            XSS.util.storage(CONST.STORAGE_MUTE, mute);
            XSS.util.instruct(instruct, 1e3);
            XSS.play.menu_alt();
        }
    },

    /**
     * @param {Shape} oldShape
     * @param {Shape} newShape
     * @param {boolean} back
     * @param {function()} callback
     * @private
     */
    _switchStageAnimate: function(oldShape, newShape, back, callback) {
        var oldStageAnim, newStageAnim, width = CONST.WIDTH - CONST.MENU_LEFT;

        if (back) {
            oldStageAnim = {to: [width, 0]};
            newStageAnim = {from: [-width, 0]};
        } else {
            oldStageAnim = {to: [-width, 0]};
            newStageAnim = {from: [width, 0]};
        }

        newStageAnim.callback = callback;

        if (back) {
            XSS.play.swoosh_rev();
        } else {
            XSS.play.swoosh();
        }

        XSS.shapes.oldstage = oldShape.clone().animate(oldStageAnim);
        XSS.shapes.newstage = newShape.clone().animate(newStageAnim);
    },

    /**
     * @param {StageInterface} stage
     * @param {boolean} back
     * @private
     */
    _setStage: function(stage, back) {
        // Remove old stages
        XSS.shapes.oldstage = null;
        XSS.shapes.newstage = null;

        this.stage = stage;
        this.stage.construct();
        this.refreshShapes();

        if (back) {
            this._history.pop();
            XSS.util.hash();
        } else {
            this._history.push(stage);
        }
    }

};

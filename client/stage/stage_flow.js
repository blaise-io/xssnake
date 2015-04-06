'use strict';

/**
 * StageFlow instantiation, stage switching
 * @param {Function=} Stage
 * @constructor
 */
xss.StageFlow = function(Stage) {
    this._FirstStage = Stage || xss.MainStage;

    xss.event.once(xss.EV_FONT_LOAD, xss.NS_FLOW, this.start.bind(this));

    this.GameStage = xss.StartGameStage;

    if (xss.font.loaded) {
        xss.event.trigger(xss.EV_FONT_LOAD);
    }
};

xss.StageFlow.prototype = {

    destruct: function() {
        this.stage.destruct();
        if (xss.player) {
            xss.player.destruct();
        }
        xss.shapes = {};
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_FLOW);
        xss.canvas.garbageCollect();
    },

    restart: function() {
        this.destruct();
        this.start();
    },

    start: function() {
        this._history = [];
        this._bindGlobalEvents();
        this._setupMenuSkeletton();
        this._setStage(new (this._FirstStage)(), false);
    },

    getData: function() {
        var value = {};
        for (var i = 0, m = this._history.length; i < m; i++) {
            xss.extend(value, this._history[i].getData());
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
        xss.shapes.stage = null;

        // Replace by levelanim
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
        xss.shapes.stage = this.stage.getShape();
    },

    _setupMenuSkeletton: function() {
        xss.shapegen.outerBorder(function(k, border) {
             xss.shapes[k] = border;
        });
        xss.shapes.HEADER = xss.shapegen.header();
    },

    /**
     * @private
     */
    _bindGlobalEvents: function() {
        window.onhashchange = this._hashChange.bind(this);
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_FLOW, this._handleKeys.bind(this));
    },

    /**
     * @private
     */
    _hashChange: function() {
        if (
            xss.util.hash(xss.HASH_ROOM).length === xss.ROOM_KEY_LENGTH &&
            1 === this._history.length
        ) {
            xss.flow.restart();
        }
    },

    /**
     * @param {Event} ev
     * @private
     */
    _handleKeys: function(ev) {
        var mute, instruct;

        // Firefox disconnects websocket on Esc. Disable that.
        // Also prevent the tab key focusing things outside canvas.
        if (ev.keyCode === xss.KEY_ESCAPE || ev.keyCode === xss.KEY_TAB) {
            ev.preventDefault();
        }

        // Ignore key when user is in input field. Start screen might
        // contain a dialog, so do not use xss.keysBlocked here.
        if (!xss.shapes.INPUT_CARET) {
            // Mute/Unmute
            if (ev.keyCode === xss.KEY_MUTE) {
                mute = !xss.util.storage(xss.STORAGE_MUTE);
                instruct = 'Sounds ' + (mute ? 'muted' : 'unmuted');
                xss.util.storage(xss.STORAGE_MUTE, mute);
                xss.util.instruct(instruct, 1e3);
                xss.audio.play('menu_alt');
            }
        }
    },

    /**
     * @param {xss.Shape} oldShape
     * @param {xss.Shape} newShape
     * @param {boolean} back
     * @param {function()} callback
     * @private
     */
    _switchStageAnimate: function(oldShape, newShape, back, callback) {
        var oldStageAnim, newStageAnim, width = xss.WIDTH - xss.MENU_LEFT;

        if (back) {
            oldStageAnim = {to: [width, 0]};
            newStageAnim = {from: [-width, 0]};
        } else {
            oldStageAnim = {to: [-width, 0]};
            newStageAnim = {from: [width, 0]};
        }

        newStageAnim.callback = callback;

        if (back) {
            xss.audio.play('swoosh_rev');
        } else {
            xss.audio.play('swoosh');
        }

        xss.shapes.oldstage = oldShape.animate(oldStageAnim);
        xss.shapes.newstage = newShape.animate(newStageAnim);
    },

    /**
     * @param {xss.StageInterface} stage
     * @param {boolean} back
     * @private
     */
    _setStage: function(stage, back) {
        // Remove animated stages
        xss.shapes.oldstage = null;
        xss.shapes.newstage = null;

        this.stage = stage;
        this.stage.construct();
        this.refreshShapes();

        if (back) {
            this._history.pop();
            xss.util.hash();
        } else {
            this._history.push(stage);
        }
    }

};

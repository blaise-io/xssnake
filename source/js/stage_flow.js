/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Util*/
'use strict';

/**
 * StageFlow instantiation, stage switching
 * @param {Function=} stageRef
 * @constructor
 */
function StageFlow(stageRef) {
    stageRef = stageRef || XSS.stages.main;

    this._prevStages.push(stageRef);

    this._disableEscKeyDefault();
    this.setupMenuSkeletton();
    this.newStage(stageRef);
}

StageFlow.prototype = {

    /** @type {Array} */
    _prevStages: [],

    /** @type {Object} */
    _stageInits: {},

    getNamedChoices: function() {
    },

    /**
     * @param {function()} stage
     * @return {StageInterface}
     */
    getStage: function(stage) {
        var key = Util.getKey(XSS.stages, stage);
        if (!this._stageInits[key]) {
            this._stageInits[key] = stage();
        }
        return this._stageInits[key];
    },

    /**
     * @param {function()} stageRef
     */
    newStage: function(stageRef) {
        this.stage = this.getStage(stageRef);
        this.setStageShapes();
        this.stage.createStage();
    },

    /**
     * @param {function()} newStageRef
     * @param {Object=} options
     */
    switchStage: function(newStageRef, options) {
        var newStage = this.getStage(newStageRef);

        options = options || {};

        // Unload old stage
        this.stage.destroyStage();

        // Remove everything
        delete XSS.shapes.instruction;
        delete XSS.shapes.stage;

        // Replace by animation
        this._switchStageAnimate(
            this.stage.getShape(),
            newStage.getShape(),
            options.back,
            function() {
                this._animateCallback(newStageRef, options.back);
            }.bind(this)
        );
    },

    previousStage: function() {
        var prevs = this._prevStages;
        if (prevs.length > 1) {
            var previous = prevs[prevs.length - 2];
            this.switchStage(previous, {back: true});
        }
    },

    setupMenuSkeletton: function() {
        XSS.shapes.border = XSS.shapegen.outerBorder();
        XSS.shapes.header = XSS.shapegen.header(XSS.MENU_LEFT);
    },

    setStageShapes: function() {
        var instruction = this.stage.getInstruction();
        XSS.shapes.stage = this.stage.getShape();
        XSS.shapes.instruction = XSS.font.shape(instruction, XSS.MENU_LEFT, 46);
    },

    /**
     * Firefox disconnects websocket on Esc O___O
     * @private
     */
    _disableEscKeyDefault: function() {
        XSS.on.keydown(function(e) {
            if (e.keyCode === XSS.KEY_ESCAPE) {
                e.preventDefault();
            }
        });
    },

    /**
     * @param {Shape} oldStage
     * @param {Shape} newStage
     * @param {boolean} back
     * @param {function()} callback
     * @private
     */
    _switchStageAnimate: function(oldStage, newStage, back, callback) {
        var oldStageAnim, newStageAnim, width = XSS.PIXELS_H;

        if (back) {
            oldStageAnim = {to: [width, 0]};
            newStageAnim = {from: [-width, 0]};
        } else {
            oldStageAnim = {to: [-width, 0]};
            newStageAnim = {from: [width, 0]};
        }

        newStageAnim.callback = callback;

        XSS.shapes.oldstage = oldStage.clone().animate(oldStageAnim);
        XSS.shapes.newstage = newStage.clone().animate(newStageAnim);
    },

    /**
     * @param {function()} newStageRef
     * @param {boolean} back
     * @private
     */
    _animateCallback: function(newStageRef, back) {
        // Remove old stages
        delete XSS.shapes.oldstage;
        delete XSS.shapes.newstage;

        // Load new stage
        this.newStage(newStageRef);

        // Log states
        if (back) {
            this._prevStages.pop();
        } else {
            this._prevStages.push(newStageRef);
        }
    }

};
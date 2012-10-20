/*jshint globalstrict:true */
/*globals XSS, Shape*/

'use strict';

/**
 * StageFlow instantiation, stage switching
 * @param {function()=} stageRef
 * @constructor
 */
function StageFlow(stageRef) {
    stageRef = stageRef || XSS.stages.main;

    this._prevStages.push(stageRef);
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
        var key = this._getReferenceKey(stage);
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
        this.stage.createStage();
        this.setStageShapes();
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
        XSS.shapes.stage = this.stage.getShape();
        XSS.shapes.instruction = new Shape(
            XSS.font.draw(XSS.MENU_LEFT, 45, this.stage.getInstruction())
        );
    },

    /**
     * @param {function()} func
     * @return {string|null}
     * @private
     */
    _getReferenceKey: function(func) {
        for (var k in XSS.stages) {
            if (XSS.stages.hasOwnProperty(k) && func === XSS.stages[k]) {
                return k;
            }
        }
        return null;
    },

    /**
     * @param {Shape} oldStage
     * @param {Shape} newStage
     * @param {boolean} back
     * @param {function()} callback
     * @private
     */
    _switchStageAnimate: function(oldStage, newStage, back, callback) {
        var oldStageAnim, newStageAnim,
            width = XSS.PIXELS_H;

        if (back) {
            oldStageAnim = {start: 0, end: width};
            newStageAnim = {start: -width, end: 0};
        } else {
            oldStageAnim = {start: 0, end: -width};
            newStageAnim = {start: width, end: 0};
        }

        newStageAnim.callback = callback;

        XSS.shapes.oldstage = oldStage.clone().dynamic(true).swipe(oldStageAnim);
        XSS.shapes.newstage = newStage.clone().dynamic(true).swipe(newStageAnim);
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
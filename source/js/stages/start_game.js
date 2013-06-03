/*jshint globalstrict:true, es5:true, sub:true, evil:true*/
/*globals XSS, CONST, GameStage*/
'use strict';

/**
 * @extends {GameStage}
 * @implements {StageInterface}
 * @constructor
 */
function StartGameStage() {
    GameStage.call(this);
}

XSS.util.extend(StartGameStage.prototype, GameStage.prototype);

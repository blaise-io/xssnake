/*globals GameStage*/
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

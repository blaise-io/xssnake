/**
 * @extends {Game}
 * @implements {StageInterface}
 * @constructor
 */
StartGameStage = function() {
    Game.call(this);
};

extend(StartGameStage.prototype, Game.prototype);
